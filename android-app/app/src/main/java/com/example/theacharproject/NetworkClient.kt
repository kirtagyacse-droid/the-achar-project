package com.example.theacharproject

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import okhttp3.Authenticator
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.Route
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object NetworkClient {
    private var okHttpClient: OkHttpClient? = null

    // Callback invoked when refresh token is invalid or expired
    var onSessionExpired: (() -> Unit)? = null

    fun getClient(context: Context, apiBaseUrl: String): OkHttpClient {
        if (okHttpClient == null) {
            val builder = OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .writeTimeout(15, TimeUnit.SECONDS)

            // Interceptor to inject Access Token Bearer Header for Admin API requests
            builder.addInterceptor(Interceptor { chain ->
                val originalRequest = chain.request()
                val requestBuilder = originalRequest.newBuilder()
                
                val path = originalRequest.url.encodedPath
                if (path.startsWith("/api/admin") && 
                    path != "/api/admin/login" && 
                    path != "/api/admin/refresh"
                ) {
                    val token = AuthManager.getAccessToken(context)
                    if (token != null) {
                        requestBuilder.header("Authorization", "Bearer $token")
                    }
                }
                
                chain.proceed(requestBuilder.build())
            })

            // Authenticator to handle 401 token refresh and retry
            builder.authenticator(object : Authenticator {
                override fun authenticate(route: Route?, response: Response): Request? {
                    synchronized(this) {
                        val path = response.request.url.encodedPath
                        if (path == "/api/admin/login" || path == "/api/admin/refresh") {
                            return null
                        }

                        val currentAccessToken = AuthManager.getAccessToken(context)
                        val requestToken = response.request.header("Authorization")?.substringAfter("Bearer ")

                        // If the token was already refreshed by another concurrent request, retry with the new one
                        if (currentAccessToken != null && currentAccessToken != requestToken) {
                            return response.request.newBuilder()
                                .header("Authorization", "Bearer $currentAccessToken")
                                .build()
                        }

                        // Get stored refresh token to execute the refresh request
                        val refreshToken = AuthManager.getRefreshToken(context) ?: return null
                        val newTokens = refreshTokens(apiBaseUrl, refreshToken)

                        if (newTokens != null) {
                            AuthManager.saveTokens(context, newTokens.first, newTokens.second)
                            return response.request.newBuilder()
                                .header("Authorization", "Bearer ${newTokens.first}")
                                .build()
                        } else {
                            // Refresh failed: session expired
                            AuthManager.clearTokens(context)
                            
                            Handler(Looper.getMainLooper()).post {
                                Toast.makeText(context, "Session expired. Please authorize again.", Toast.LENGTH_LONG).show()
                                onSessionExpired?.invoke()
                            }
                            return null
                        }
                    }
                }
            })

            okHttpClient = builder.build()
        }
        return okHttpClient!!
    }

    private fun refreshTokens(apiBaseUrl: String, refreshToken: String): Pair<String, String>? {
        val client = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .build()

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val json = JSONObject().apply {
            put("refreshToken", refreshToken)
        }
        
        val request = Request.Builder()
            .url("$apiBaseUrl/api/admin/refresh")
            .post(json.toString().toRequestBody(mediaType))
            .build()

        return try {
            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    if (responseBody != null) {
                        val jsonObject = JSONObject(responseBody)
                        val success = jsonObject.optBoolean("success", false)
                        if (success) {
                            val newAccess = jsonObject.getString("accessToken")
                            val newRefresh = jsonObject.optString("refreshToken", refreshToken)
                            Pair(newAccess, newRefresh)
                        } else {
                            null
                        }
                    } else {
                        null
                    }
                } else {
                    null
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
