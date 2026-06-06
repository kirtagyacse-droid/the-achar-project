package com.example.theacharproject

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import androidx.compose.ui.res.painterResource
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import java.io.DataOutputStream
import android.provider.OpenableColumns
import com.example.theacharproject.theme.TheAcharProjectTheme
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlin.math.cos
import kotlin.math.sin

// --- Data Models ---
data class FlavorProfile(
    val tangy: Int = 3,
    val spicy: Int = 3,
    val sweet: Int = 1,
    val savory: Int = 3,
    val salty: Int = 3
)

data class Product(
    val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val imageUrl: String?,
    val category: String,
    val stockStatus: String,
    val stockCount: Int,
    val spiciness: Int,
    val flavorProfile: FlavorProfile = FlavorProfile(),
    val batchNumber: String = "Batch #012",
    val season: String? = null  // null=always, "summer", "winter", "pantry"
)

data class CartItem(
    val product: Product,
    var quantity: Int
)

enum class Screen {
    Catalog, Quiz, Passport, Returns, Diary, Admin
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TheAcharProjectTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFFFFFFFF) // White background matching website
                ) {
                    NativeAppLayout()
                }
            }
        }
    }
}

// --- Local Cache Helpers ---
fun saveProductsCache(context: Context, jsonStr: String) {
    val sharedPref = context.getSharedPreferences("achar_pref", Context.MODE_PRIVATE)
    sharedPref.edit().putString("products_cache", jsonStr).apply()
}

fun getProductsCache(context: Context): List<Product> {
    val sharedPref = context.getSharedPreferences("achar_pref", Context.MODE_PRIVATE)
    val jsonStr = sharedPref.getString("products_cache", null) ?: return emptyList()
    return parseProductsJson(jsonStr)
}

fun parseProductsJson(jsonStr: String): List<Product> {
    try {
        val jsonArray = JSONArray(jsonStr)
        val list = mutableListOf<Product>()
        for (i in 0 until jsonArray.length()) {
            val obj = jsonArray.getJSONObject(i)
            val flavorObj = obj.optJSONObject("flavorProfile")
            val flavor = if (flavorObj != null) {
                FlavorProfile(
                    tangy = flavorObj.optInt("tangy", 3),
                    spicy = flavorObj.optInt("spicy", 3),
                    sweet = flavorObj.optInt("sweet", 1),
                    savory = flavorObj.optInt("savory", 3),
                    salty = flavorObj.optInt("salty", 3)
                )
            } else {
                FlavorProfile()
            }
            list.add(
                Product(
                    id = obj.getString("id"),
                    name = obj.getString("name"),
                    description = obj.getString("description"),
                    price = obj.getDouble("price"),
                    imageUrl = obj.optString("imageUrl", null),
                    category = obj.optString("category", "Pickle"),
                    stockStatus = obj.optString("stockStatus", "IN_STOCK"),
                    stockCount = obj.optInt("stockCount", 10),
                    spiciness = obj.optInt("spiciness", 2),
                    flavorProfile = flavor,
                    batchNumber = obj.optString("batchNumber", "Batch #012"),
                    season = obj.optString("season", null).let { if (it == "null" || it.isNullOrBlank()) null else it }
                )
            )
        }
        return list
    } catch (e: Exception) {
        e.printStackTrace()
        return emptyList()
    }
}

@Composable
fun SplashScreen(onTimeout: () -> Unit) {
    var startAnimation by remember { mutableStateOf(false) }
    
    val alphaAnim by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = androidx.compose.animation.core.tween(
            durationMillis = 1200,
            easing = androidx.compose.animation.core.FastOutSlowInEasing
        )
    )
    
    val scaleAnim by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0.85f,
        animationSpec = androidx.compose.animation.core.tween(
            durationMillis = 1200,
            easing = androidx.compose.animation.core.FastOutSlowInEasing
        )
    )

    LaunchedEffect(Unit) {
        startAnimation = true
        delay(2800)
        onTimeout()
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFCF9F5)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Top Image Card (45% height)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(0.45f)
                    .clip(RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp))
                    .border(
                        width = 2.dp,
                        brush = Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Color(0xFFD4AF37))
                        ),
                        shape = RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp)
                    )
            ) {
                Image(
                    painter = painterResource(id = R.drawable.splash_achar),
                    contentDescription = "Traditional Rajasthani Achar",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .alpha(0.9f)
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color(0x33000000), Color(0x667B1C1C)),
                                startY = 0f
                            )
                        )
                )
            }
            
            // Bottom Information Panel (55% height)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(0.55f)
                    .padding(horizontal = 24.dp, vertical = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Top
            ) {
                Spacer(modifier = Modifier.height(56.dp))
                
                Text(
                    text = "RS SAVOURY",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 3.sp,
                    fontSize = 32.sp,
                    color = Color(0xFF9A2C2C),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.alpha(alphaAnim).scale(scaleAnim)
                )
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = "ARTISANAL GOURMET",
                    fontFamily = FontFamily.SansSerif,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 5.sp,
                    fontSize = 11.sp,
                    color = Color(0xFF888888),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.alpha(alphaAnim)
                )
                Spacer(modifier = Modifier.height(20.dp))
                
                Text(
                    text = "Jaipur's Sun-Matured Heritage",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Medium,
                    fontSize = 15.sp,
                    color = Color(0xFF722020),
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.alpha(alphaAnim)
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Generational recipes handcrafted in cold-pressed mustard oil",
                    fontFamily = FontFamily.SansSerif,
                    fontSize = 11.sp,
                    color = Color(0xFF999999),
                    textAlign = TextAlign.Center,
                    lineHeight = 16.sp,
                    modifier = Modifier.alpha(alphaAnim).padding(horizontal = 16.dp)
                )
            }
        }
        
        // Circular Overlapping Logo (Centered boundary)
        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .offset(y = (-40).dp)
                .alpha(alphaAnim)
                .scale(scaleAnim)
        ) {
            Image(
                painter = painterResource(id = R.drawable.logo),
                contentDescription = "RS Savoury Jar Icon",
                modifier = Modifier
                    .size(110.dp)
                    .clip(RoundedCornerShape(55.dp))
                    .background(Color.White)
                    .border(2.dp, Color(0xFFD4AF37), RoundedCornerShape(55.dp))
                    .shadow(elevation = 10.dp, shape = RoundedCornerShape(55.dp), ambientColor = Color(0x33000000))
                    .padding(8.dp)
            )
        }
        
        // Developer credits with system navigation safe zone padding
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 24.dp)
                .alpha(alphaAnim)
        ) {
            Text(
                text = "developed by KT",
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Medium,
                fontSize = 11.sp,
                color = Color(0xFF888888),
                letterSpacing = 1.sp
            )
        }
    }
}

// --- Main Layout ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NativeAppLayout() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val sharedPref = remember { context.getSharedPreferences("achar_pref", Context.MODE_PRIVATE) }
    
    var apiBaseUrl by remember { 
        mutableStateOf(sharedPref.getString("target_url", "https://rssavoury.com") ?: "https://rssavoury.com") 
    }
    
    var showSplash by remember { mutableStateOf(true) }
    
    // Screens State
    var currentScreen by remember { mutableStateOf(Screen.Catalog) }
    var selectedProduct by remember { mutableStateOf<Product?>(null) }
    var showCartSheet by remember { mutableStateOf(false) }
    var showCheckoutScreen by remember { mutableStateOf(false) }
    var devTapCount by remember { mutableStateOf(0) }
    var showDevDialog by remember { mutableStateOf(false) }
    var adminTapCount by remember { mutableStateOf(0) }
    var showAdminLoginDialog by remember { mutableStateOf(false) }
    var isAdminLoggedIn by remember { mutableStateOf(false) }
    var isGiftOrder by remember { mutableStateOf(false) }
    var giftWrapType by remember { mutableStateOf("cloth") } // "cloth" or "wood"
    var giftMessageText by remember { mutableStateOf("") }
    
    // Product Catalog State
    var productsList by remember { mutableStateOf<List<Product>>(emptyList()) }
    var isLoadingProducts by remember { mutableStateOf(false) }
    var isOfflineMode by remember { mutableStateOf(false) }

    // Cart Management
    val cartItems = remember { mutableStateListOf<CartItem>() }

    // Load initial offline products cache
    LaunchedEffect(Unit) {
        productsList = getProductsCache(context)
        // Fetch fresh online products
        loadProductsFromApi(
            context = context,
            apiBaseUrl = apiBaseUrl,
            onUrlResolved = { resolvedUrl ->
                apiBaseUrl = resolvedUrl
                sharedPref.edit().putString("target_url", resolvedUrl).apply()
            },
            onSuccess = { freshList ->
                productsList = freshList
                isOfflineMode = false
            },
            onError = {
                isOfflineMode = true
                if (productsList.isEmpty()) {
                    // If cache empty, seed dummy products for complete offline usability
                    productsList = getDummyOfflineProducts()
                }
            }
        )
    }

    if (showSplash) {
        SplashScreen(onTimeout = { showSplash = false })
    } else {
        Scaffold(
            topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.logo),
                            contentDescription = "RS Savoury Logo",
                            modifier = Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(50))
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "RS SAVOURY",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp,
                            fontSize = 15.sp,
                            color = Color(0xFF9A2C2C),
                            modifier = Modifier.clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) {
                                devTapCount++
                                if (devTapCount >= 5) {
                                    showDevDialog = true
                                    devTapCount = 0
                                }
                            }
                        )
                        Text(
                            text = "JAIPUR",
                            fontFamily = FontFamily.SansSerif,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 3.sp,
                            fontSize = 9.sp,
                            color = Color(0xFF888888),
                            modifier = Modifier.clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) {
                                adminTapCount++
                                if (adminTapCount >= 5) {
                                    showAdminLoginDialog = true
                                    adminTapCount = 0
                                }
                            }
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { showCartSheet = true }) {
                        Box {
                            Text("🛒", fontSize = 20.sp)
                            if (cartItems.isNotEmpty()) {
                                Badge(
                                    containerColor = Color(0xFF9A2C2C),
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .offset(x = 6.dp, y = (-4).dp)
                                ) {
                                    Text(
                                        text = cartItems.sumOf { it.quantity }.toString(),
                                        color = Color.White,
                                        fontSize = 10.sp
                                    )
                                }
                            }
                        }
                    }
                },
                actions = {
                    if (isOfflineMode) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Text("⚠️", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Offline", color = Color(0xFF9A2C2C), fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Serif)
                        }
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color(0xFFFFFFFF),
                    titleContentColor = Color(0xFF1A1A1A)
                )
            )
        },
        bottomBar = {
            // Floating capsule nav bar — clears phone gesture bar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(start = 16.dp, end = 16.dp, bottom = 10.dp, top = 4.dp)
            ) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(64.dp)
                        .shadow(elevation = 12.dp, shape = RoundedCornerShape(32.dp), ambientColor = Color(0x22000000))
                        .border(1.dp, Color(0x0D000000), RoundedCornerShape(32.dp)),
                    shape = RoundedCornerShape(32.dp),
                    color = Color.White
                ) {
                    Row(
                        modifier = Modifier.fillMaxSize().padding(horizontal = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        // nav items: (screen, unicode-glyph, label)
                        val navItems = listOf(
                            Triple(Screen.Catalog,  "\u2302", "Menu"),
                            Triple(Screen.Quiz,     "\u2315", "Quiz"),
                            Triple(Screen.Passport, "\u2605", "Passport"),
                            Triple(Screen.Returns,  "\u21BA", "Returns"),
                            Triple(Screen.Diary,    "\u25A4", "Diary")
                        )

                        navItems.forEach { (screen, glyph, label) ->
                            val selected = currentScreen == screen
                            val interactionSource = remember { MutableInteractionSource() }

                            Column(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable(
                                        interactionSource = interactionSource,
                                        indication = null,
                                        onClick = { currentScreen = screen }
                                    ),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                // Icon — always same gray, no background box
                                Text(
                                    text = glyph,
                                    fontSize = 20.sp,
                                    color = if (selected) Color(0xFF9A2C2C) else Color(0xFF888888),
                                    fontWeight = FontWeight.Normal
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                // Label text — highlighted when selected
                                Text(
                                    text = label,
                                    color = if (selected) Color(0xFF9A2C2C) else Color(0xFF888888),
                                    fontSize = 9.sp,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                    fontFamily = FontFamily.Serif,
                                    letterSpacing = if (selected) 0.3.sp else 0.sp
                                )
                                // Elegant underline dot indicator
                                Spacer(modifier = Modifier.height(2.dp))
                                Box(
                                    modifier = Modifier
                                        .size(width = if (selected) 16.dp else 0.dp, height = 2.dp)
                                        .clip(RoundedCornerShape(1.dp))
                                        .background(if (selected) Color(0xFF9A2C2C) else Color.Transparent)
                                )
                            }
                        }
                    }
                }
            }
        },
        containerColor = Color(0xFFFFFFFF)
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentScreen) {
                Screen.Catalog -> CatalogScreen(
                    productsList = productsList,
                    apiBaseUrl = apiBaseUrl,
                    onProductClick = { selectedProduct = it },
                    onAddToCart = { prod ->
                        val existing = cartItems.find { it.product.id == prod.id }
                        if (existing != null) {
                            existing.quantity++
                        } else {
                            cartItems.add(CartItem(prod, 1))
                        }
                        Toast.makeText(context, "${prod.name} added to cart", Toast.LENGTH_SHORT).show()
                    },
                    onNavigateToScreen = { currentScreen = it }
                )
                Screen.Quiz -> OnboardingQuizScreen(productsList) { prod ->
                    selectedProduct = prod
                    currentScreen = Screen.Catalog
                }
                Screen.Passport -> PassportScreen(productsList)
                Screen.Returns -> ReturnsScreen(apiBaseUrl, isOfflineMode)
                Screen.Diary -> DiaryScreen()
                Screen.Admin -> AdminScreen(apiBaseUrl = apiBaseUrl, onBack = { currentScreen = Screen.Catalog })
            }
        }
    }

    // --- Dev Settings Dialog ---
    if (showDevDialog) {
        var inputUrl by remember { mutableStateOf(apiBaseUrl) }
        AlertDialog(
            onDismissRequest = { showDevDialog = false },
            title = { Text("Dev URL Config", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    OutlinedTextField(
                        value = inputUrl,
                        onValueChange = { inputUrl = it },
                        label = { Text("API Backend URL") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF9A2C2C),
                            focusedLabelColor = Color(0xFF9A2C2C)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = { inputUrl = "http://10.154.196.10:3000" },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
                        shape = RoundedCornerShape(0.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Use local laptop server", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = { inputUrl = "https://rssavoury.com" },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF333333), contentColor = Color.White),
                        shape = RoundedCornerShape(0.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Use production Domain", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        apiBaseUrl = inputUrl
                        sharedPref.edit().putString("target_url", inputUrl).apply()
                        showDevDialog = false
                        // Reload products
                        scope.launch {
                            loadProductsFromApi(
                                context = context,
                                apiBaseUrl = apiBaseUrl,
                                onSuccess = { freshList ->
                                    productsList = freshList
                                    isOfflineMode = false
                                },
                                onError = {
                                    isOfflineMode = true
                                }
                            )
                        }
                    }
                ) {
                    Text("Save & Sync", color = Color(0xFF9A2C2C), fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDevDialog = false }) {
                    Text("Cancel", color = Color(0xFF666666), fontFamily = FontFamily.Serif)
                }
            },
            containerColor = Color(0xFFFFFFFF)
        )
    }

    // --- Admin Authorization Dialog ---
    if (showAdminLoginDialog) {
        var inputPassword by remember { mutableStateOf("") }
        var isError by remember { mutableStateOf(false) }
        
        AlertDialog(
            onDismissRequest = { showAdminLoginDialog = false },
            title = { Text("Admin Authorization", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text("Please enter the admin password to access the panel:", fontSize = 14.sp, color = Color(0xFF666666))
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = inputPassword,
                        onValueChange = { inputPassword = it; isError = false },
                        label = { Text("Password") },
                        singleLine = true,
                        visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
                        isError = isError,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF9A2C2C),
                            focusedLabelColor = Color(0xFF9A2C2C)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    if (isError) {
                        Text("Incorrect password, please try again.", color = Color(0xFF9A2C2C), fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (inputPassword == "achar-admin") {
                            showAdminLoginDialog = false
                            isAdminLoggedIn = true
                            currentScreen = Screen.Admin
                        } else {
                            isError = true
                        }
                    }
                ) {
                    Text("Authorize", color = Color(0xFF9A2C2C), fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAdminLoginDialog = false }) {
                    Text("Cancel", color = Color(0xFF666666), fontFamily = FontFamily.Serif)
                }
            },
            containerColor = Color(0xFFFFFFFF)
        )
    }

    // --- Product Details Dialog ---
    if (selectedProduct != null) {
        ProductDetailsDialog(
            product = selectedProduct!!,
            apiBaseUrl = apiBaseUrl,
            onDismiss = { selectedProduct = null },
            onAddToCart = { prod ->
                val existing = cartItems.find { it.product.id == prod.id }
                if (existing != null) {
                    existing.quantity++
                } else {
                    cartItems.add(CartItem(prod, 1))
                }
                Toast.makeText(context, "${prod.name} added to cart", Toast.LENGTH_SHORT).show()
                selectedProduct = null
            }
        )
    }

    // --- Cart Dialog Bottom Sheet ---
    if (showCartSheet) {
        ModalBottomSheet(
            onDismissRequest = { showCartSheet = false },
            containerColor = Color.White,
            contentColor = Color(0xFF1A1A1A),
            tonalElevation = 0.dp
        ) {
            CartSheetContent(
                cartItems = cartItems,
                isGiftOrder = isGiftOrder,
                giftWrapType = giftWrapType,
                giftMessageText = giftMessageText,
                onGiftChange = { isGiftOrder = it },
                onGiftWrapChange = { giftWrapType = it },
                onGiftMessageChange = { giftMessageText = it },
                onCheckoutClick = {
                    showCartSheet = false
                    showCheckoutScreen = true
                },
                onRemove = { item -> cartItems.remove(item) },
                onUpdateQuantity = { item, q ->
                    if (q <= 0) {
                        cartItems.remove(item)
                    } else {
                        item.quantity = q
                    }
                }
            )
        }
    }

    // --- Checkout Overlay Screen ---
    if (showCheckoutScreen) {
        CheckoutScreen(
            cartItems = cartItems,
            isGiftOrder = isGiftOrder,
            giftWrapType = giftWrapType,
            giftMessageText = giftMessageText,
            apiBaseUrl = apiBaseUrl,
            isOffline = isOfflineMode,
            onDismiss = { showCheckoutScreen = false },
            onOrderSuccess = {
                cartItems.clear()
                showCheckoutScreen = false
                Toast.makeText(context, "Order Placed Successfully!", Toast.LENGTH_LONG).show()
            }
        )
        }
    }
}

// --- Loading API products ---
fun loadProductsFromApi(
    context: Context,
    apiBaseUrl: String,
    onUrlResolved: (String) -> Unit = {},
    onSuccess: (List<Product>) -> Unit,
    onError: () -> Unit
) {
    CoroutineScope(Dispatchers.Main).launch {
        try {
            val list = withContext(Dispatchers.IO) {
                val url = URL("$apiBaseUrl/api/products")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 8000
                connection.readTimeout = 8000
                val code = connection.responseCode
                if (code == 200) {
                    val reader = BufferedReader(InputStreamReader(connection.inputStream))
                    val sb = StringBuilder()
                    var line: String?
                    while (reader.readLine().also { line = it } != null) {
                        sb.append(line)
                    }
                    reader.close()
                    val responseStr = sb.toString()
                    saveProductsCache(context, responseStr)
                    parseProductsJson(responseStr)
                } else {
                    throw Exception("Non 200 code: $code")
                }
            }
            onUrlResolved(apiBaseUrl)
            onSuccess(list)
        } catch (e: Exception) {
            e.printStackTrace()
            // If the custom domain fails, try to fallback to the vercel domain
            if (apiBaseUrl == "https://rssavoury.com") {
                try {
                    val fallbackUrlStr = "https://the-achar-project.vercel.app"
                    val fallbackList = withContext(Dispatchers.IO) {
                        val url = URL("$fallbackUrlStr/api/products")
                        val connection = url.openConnection() as HttpURLConnection
                        connection.requestMethod = "GET"
                        connection.connectTimeout = 8000
                        connection.readTimeout = 8000
                        val code = connection.responseCode
                        if (code == 200) {
                            val reader = BufferedReader(InputStreamReader(connection.inputStream))
                            val sb = StringBuilder()
                            var line: String?
                            while (reader.readLine().also { line = it } != null) {
                                sb.append(line)
                            }
                            reader.close()
                            val responseStr = sb.toString()
                            saveProductsCache(context, responseStr)
                            parseProductsJson(responseStr)
                        } else {
                            throw Exception("Non 200 code: $code")
                        }
                    }
                    onUrlResolved(fallbackUrlStr)
                    onSuccess(fallbackList)
                    return@launch
                } catch (fallbackEx: Exception) {
                    fallbackEx.printStackTrace()
                }
            }
            onError()
        }
    }
}

// Seed dummy offline products in case of zero internet and empty cache
fun getDummyOfflineProducts(): List<Product> {
    return listOf(
        Product("1", "Keri Ka Khatta Achar", "Traditional sour sundried mango pickle with homeground spices.", 180.0, null, "Mango", "IN_STOCK", 12, 2, FlavorProfile(5, 4, 1, 4, 3)),
        Product("2", "Keri Ka Meetha Achar", "Sweet and sour mango pickle cured under the hot Jaipur sun.", 200.0, null, "Mango", "IN_STOCK", 5, 1, FlavorProfile(4, 2, 5, 3, 2)),
        Product("3", "Keri with Deshi Chana", "Jaipur specialty mango pickle cured with dark deshi chickpeas.", 190.0, null, "Mango", "IN_STOCK", 8, 2, FlavorProfile(5, 3, 1, 5, 4)),
        Product("4", "Teekha Hari Mirch", "Fiery hand-cut green chilies loaded with mustard seeds and lime.", 150.0, null, "Green Chili", "IN_STOCK", 15, 3, FlavorProfile(3, 5, 0, 4, 4)),
        Product("5", "Nimbu Khatta Meetha", "Decade-old recipe sweet and sour lime pickle. Completely oil-free.", 170.0, null, "Lemon", "IN_STOCK", 3, 1, FlavorProfile(4, 2, 4, 3, 3)),
        Product("6", "Artisanal Lasua Pickle", "Rare wild gunda berries pickled in rich mustard oil and pickling spices.", 220.0, null, "Delicacies", "IN_STOCK", 6, 2, FlavorProfile(3, 3, 1, 5, 4))
    )
}

// --- Canvas Drawn Placeholder Jar ---
@Composable
fun CanvasJarPlaceholder(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        
        // Background Shadow
        drawCircle(
            color = Color(0x33000000),
            radius = w * 0.45f,
            center = Offset(w / 2f, h * 0.55f)
        )
        
        // Jar Body path
        val jarPath = Path().apply {
            moveTo(w * 0.3f, h * 0.25f)
            lineTo(w * 0.7f, h * 0.25f)
            quadraticTo(w * 0.85f, h * 0.35f, w * 0.85f, h * 0.5f)
            lineTo(w * 0.85f, h * 0.8f)
            quadraticTo(w * 0.85f, h * 0.9f, w * 0.75f, h * 0.9f)
            lineTo(w * 0.25f, h * 0.9f)
            quadraticTo(w * 0.15f, h * 0.9f, w * 0.15f, h * 0.8f)
            lineTo(w * 0.15f, h * 0.5f)
            quadraticTo(w * 0.15f, h * 0.35f, w * 0.3f, h * 0.25f)
        }
        
        // Fill Jar with Pickle Content (Maroon gradient)
        drawPath(
            path = jarPath,
            brush = Brush.verticalGradient(
                colors = listOf(Color(0xFF7B1C1C), Color(0xFF3E0A0A)),
                startY = h * 0.3f,
                endY = h * 0.9f
            )
        )

        // Glass reflection/border
        drawPath(
            path = jarPath,
            color = Color(0x33FFFFFF),
            style = Stroke(width = 4.dp.toPx())
        )
        
        // Gold Jar Lid
        val lidPath = Path().apply {
            moveTo(w * 0.28f, h * 0.15f)
            lineTo(w * 0.72f, h * 0.15f)
            quadraticTo(w * 0.75f, h * 0.15f, w * 0.75f, h * 0.2f)
            lineTo(w * 0.75f, h * 0.25f)
            lineTo(w * 0.25f, h * 0.25f)
            lineTo(w * 0.25f, h * 0.2f)
            quadraticTo(w * 0.25f, h * 0.15f, w * 0.28f, h * 0.15f)
        }
        drawPath(
            path = lidPath,
            brush = Brush.verticalGradient(
                colors = listOf(Color(0xFFFFD700), Color(0xFFB8860B)),
                startY = h * 0.15f,
                endY = h * 0.25f
            )
        )
        
        // Jar Label
        val labelPath = Path().apply {
            moveTo(w * 0.28f, h * 0.48f)
            lineTo(w * 0.72f, h * 0.48f)
            lineTo(w * 0.72f, h * 0.72f)
            lineTo(w * 0.28f, h * 0.72f)
            close()
        }
        drawPath(
            path = labelPath,
            color = Color(0xFFFAFAFA)
        )
        drawPath(
            path = labelPath,
            color = Color(0xFF9A2C2C),
            style = Stroke(width = 1.dp.toPx())
        )
    }
}

// --- Homepage sub-components ---

@Composable
fun FirstTimerBanner(
    productsList: List<Product>,
    onBannerClick: (Product) -> Unit
) {
    var visible by remember { mutableStateOf(true) }
    val starterTrio = productsList.find { it.name.contains("Starter Trio", ignoreCase = true) }
    
    if (visible && starterTrio != null) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF9A2C2C))
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "✨ New here? Find your perfect flavor with Aunty's Starter Trio (Save ₹51) →",
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                fontFamily = FontFamily.Serif,
                modifier = Modifier
                    .weight(1f)
                    .clickable { onBannerClick(starterTrio) }
            )
            Text(
                text = "×",
                color = Color.White,
                fontSize = 20.sp,
                modifier = Modifier
                    .clickable { visible = false }
                    .padding(horizontal = 8.dp)
            )
        }
    }
}

@Composable
fun HeroSection(
    onExploreClick: () -> Unit,
    onQuizClick: () -> Unit,
    onClubClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .border(1.dp, Color(0xFF9A2C2C), RoundedCornerShape(2.dp))
                .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            Text(
                text = "ESTD. 2026 • JAIPUR",
                color = Color(0xFF9A2C2C),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Artisanal Pickles",
            fontFamily = FontFamily.Serif,
            fontSize = 30.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF1A1A1A),
            textAlign = TextAlign.Center
        )
        Text(
            text = "Sun-Dried & Hand-Matured",
            fontFamily = FontFamily.Serif,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF9A2C2C),
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Text(
            text = "Generational recipes from Rajasthan, crafted in small batches using cold-pressed mustard oil and pure local spices.",
            color = Color(0xFF666666),
            fontSize = 14.sp,
            textAlign = TextAlign.Center,
            lineHeight = 20.sp,
            fontFamily = FontFamily.Serif
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = onExploreClick,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
            modifier = Modifier.fillMaxWidth().height(44.dp),
            shape = RoundedCornerShape(0.dp)
        ) {
            Text("Explore The Catalog", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold, fontSize = 13.sp)
        }
        
        Spacer(modifier = Modifier.height(10.dp))
        
        OutlinedButton(
            onClick = onQuizClick,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF9A2C2C)),
            border = BorderStroke(1.dp, Color(0xFF9A2C2C)),
            modifier = Modifier.fillMaxWidth().height(44.dp),
            shape = RoundedCornerShape(0.dp)
        ) {
            Text("Find Your Perfect Pickle →", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold, fontSize = 13.sp)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Join the Achar Club →",
            color = Color(0xFF9A2C2C),
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Serif,
            modifier = Modifier
                .clickable { onClubClick() }
                .padding(8.dp)
        )
    }
}

@Composable
fun HeroHighlightBanner(
    apiBaseUrl: String,
    productsList: List<Product>,
    onProductClick: (Product) -> Unit
) {
    val keriKhatta = productsList.find { it.name.contains("Keri ka Khatta", ignoreCase = true) }
        ?: productsList.find { it.name.contains("Keri", ignoreCase = true) }
    
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(240.dp)
            .padding(16.dp)
            .border(1.dp, Color(0xFFEAEAEA), RoundedCornerShape(0.dp))
            .clickable { keriKhatta?.let { onProductClick(it) } }
    ) {
        val imageUrl = keriKhatta?.imageUrl ?: "/uploads/keri-ka-khatta.jpg"
        val fullUrl = if (imageUrl.startsWith("/")) "$apiBaseUrl$imageUrl" else imageUrl
        
        AsyncImage(
            model = fullUrl,
            contentDescription = "Signature Keri Ka Khatta",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
        
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, Color(0xBB000000)),
                        startY = 150f
                    )
                )
        )
        
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .background(Color(0xFF9A2C2C))
                    .padding(horizontal = 8.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "OUR SIGNATURE",
                    color = Color.White,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = keriKhatta?.name ?: "Keri Ka Khatta",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Serif
            )
            Text(
                text = "Sun-matured over 21 days in traditional ceramic jars (martabans).",
                color = Color(0xFFDCDCDC),
                fontSize = 12.sp,
                fontFamily = FontFamily.Serif
            )
        }
    }
}

@Composable
fun ProcessWallGallery() {
    val processImages = listOf(
        Pair("https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=400&auto=format&fit=crop", "Hand-picking"),
        Pair("https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop", "Sun-drying"),
        Pair("https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=400&auto=format&fit=crop", "Grinding spices"),
        Pair("https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop", "Cold-pressing"),
        Pair("https://images.unsplash.com/photo-1536622432212-dbb67926b218?q=80&w=400&auto=format&fit=crop", "Hand-packing"),
        Pair("https://images.unsplash.com/photo-1589135304905-6f66c343f2cd?q=80&w=400&auto=format&fit=crop", "Sealed with love")
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 24.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "OUR SUN-DRYING PROCESS",
                color = Color(0xFF9A2C2C),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Made the Old Way",
                fontFamily = FontFamily.Serif,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1A1A1A)
            )
            Divider(color = Color(0xFF9A2C2C), thickness = 2.dp, modifier = Modifier.width(40.dp).padding(top = 10.dp))
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            processImages.forEachIndexed { index, pair ->
                Box(
                    modifier = Modifier
                        .size(140.dp, 180.dp)
                        .border(1.dp, Color(0xFFEAEAEA))
                ) {
                    AsyncImage(
                        model = pair.first,
                        contentDescription = pair.second,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                    
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(Color.Transparent, Color(0x99000000)),
                                    startY = 120f
                                )
                            )
                    )

                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(10.dp)
                    ) {
                        Text(
                            text = "0${index + 1}",
                            color = Color(0xFF9A2C2C),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = pair.second,
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Serif
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ProvenanceMapSection() {
    val points = listOf(
        Triple("Jodhpur Mangoes", 0.38f, 0.53f),
        Triple("Jaipur Garlic", 0.62f, 0.47f),
        Triple("Pushkar Chilis", 0.50f, 0.60f),
        Triple("Mustard Oil", 0.30f, 0.73f),
        Triple("Himalayan Salt", 0.53f, 0.20f)
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .background(Color(0xFFFAFAFA))
            .border(1.dp, Color(0xFFEAEAEA))
            .padding(16.dp)
    ) {
        Text(
            text = "PROVENANCE & ORIGIN",
            color = Color(0xFF9A2C2C),
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Sourced From the Heart of Rajasthan",
            fontFamily = FontFamily.Serif,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1A1A1A)
        )
        
        Spacer(modifier = Modifier.height(16.dp))

        BoxWithConstraints(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp)
                .background(Color(0xFFFCFAF2))
                .border(1.dp, Color(0xFFE8E4D8))
        ) {
            val containerWidth = maxWidth
            val containerHeight = maxHeight

            Canvas(modifier = Modifier.fillMaxSize()) {
                val w = size.width
                val h = size.height

                val gridStroke = Stroke(width = 0.5.dp.toPx())
                for (x in 1..3) {
                    drawLine(Color(0x0C7B1C1C), Offset(w * (x / 4f), 0f), Offset(w * (x / 4f), h), strokeWidth = gridStroke.width)
                }
                for (y in 1..3) {
                    drawLine(Color(0x0C7B1C1C), Offset(0f, h * (y / 4f)), Offset(w, h * (y / 4f)), strokeWidth = gridStroke.width)
                }

                val polyPoints = listOf(
                    Offset(0.48f, 0.10f),
                    Offset(0.60f, 0.13f),
                    Offset(0.70f, 0.20f),
                    Offset(0.80f, 0.37f),
                    Offset(0.85f, 0.53f),
                    Offset(0.88f, 0.67f),
                    Offset(0.78f, 0.80f),
                    Offset(0.63f, 0.90f),
                    Offset(0.45f, 0.87f),
                    Offset(0.28f, 0.77f),
                    Offset(0.15f, 0.60f),
                    Offset(0.18f, 0.40f),
                    Offset(0.33f, 0.20f)
                )

                val path = Path().apply {
                    val first = polyPoints.first()
                    moveTo(first.x * w, first.y * h)
                    for (i in 1 until polyPoints.size) {
                        val pt = polyPoints[i]
                        lineTo(pt.x * w, pt.y * h)
                    }
                    close()
                }

                drawPath(path, Color(0xFFFAF6EE))
                drawPath(path, Color(0xFF7B1C1C), style = Stroke(width = 1.5.dp.toPx()))
            }

            points.forEach { pt ->
                val xOffset = containerWidth * pt.second
                val yOffset = containerHeight * pt.third

                Box(
                    modifier = Modifier
                        .offset(xOffset - 6.dp, yOffset - 6.dp)
                        .size(12.dp)
                        .background(Color(0x339A2C2C), RoundedCornerShape(6.dp))
                )
                Box(
                    modifier = Modifier
                        .offset(xOffset - 3.dp, yOffset - 3.dp)
                        .size(6.dp)
                        .background(Color(0xFF9A2C2C), RoundedCornerShape(3.dp))
                )

                Box(
                    modifier = Modifier
                        .offset(xOffset + 6.dp, yOffset - 8.dp)
                        .background(Color(0xE6FFFFFF), RoundedCornerShape(2.dp))
                        .border(0.5.dp, Color(0xFF9A2C2C), RoundedCornerShape(2.dp))
                        .padding(horizontal = 4.dp, vertical = 1.dp)
                ) {
                    Text(
                        text = pt.first,
                        color = Color(0xFF1A1A1A),
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "We believe a great pickle begins with the soil. Every single mango, garlic pod, and fiery chili in our recipes is sourced directly from dedicated local farmers across Jodhpur, Jaipur, and Pushkar.",
            color = Color(0xFF666666),
            fontSize = 13.sp,
            lineHeight = 18.sp,
            fontFamily = FontFamily.Serif
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = "Submerged in cold-pressed mustard oil and cured in traditional stone martabans, these ingredients mature under the warm sun, capturing the authentic desert terroir of Rajasthan.",
            color = Color(0xFF666666),
            fontSize = 13.sp,
            lineHeight = 18.sp,
            fontFamily = FontFamily.Serif
        )
    }
}

@Composable
fun BrandStorySection(apiBaseUrl: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "OUR HERITAGE",
            color = Color(0xFF9A2C2C),
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Ghar Ka Swaad, Honored Across Generations",
            fontFamily = FontFamily.Serif,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1A1A1A),
            textAlign = TextAlign.Center
        )
        Divider(color = Color(0xFF9A2C2C), thickness = 2.dp, modifier = Modifier.width(40.dp).padding(top = 10.dp))

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Every jar of our pickle is a labor of love. We start by sourcing raw mangoes, tender lehsua, and fresh green chilies from local farms in Jaipur.",
            color = Color(0xFF666666),
            fontSize = 13.sp,
            lineHeight = 18.sp,
            fontFamily = FontFamily.Serif,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Following the instructions passed down by our grandmothers, we sun-dry our ingredients, blend them with freshly ground spices, and submerge them in pure mustard oil. We let them sit under the warm Rajasthani sun to mature naturally.",
            color = Color(0xFF666666),
            fontSize = 13.sp,
            lineHeight = 18.sp,
            fontFamily = FontFamily.Serif,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "No chemicals, no artificial colors, no shortcuts. Just raw, pure flavor that takes you straight back to childhood summer vacations.",
            color = Color(0xFF666666),
            fontSize = 13.sp,
            lineHeight = 18.sp,
            fontFamily = FontFamily.Serif,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(16.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
                .border(1.dp, Color(0xFFEAEAEA))
        ) {
            AsyncImage(
                model = "$apiBaseUrl/uploads/teekha-hari-mirch.jpg",
                contentDescription = "Brand Heritage Image",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .background(Color(0xCC1A1A1A))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text("Jaipur, Rajasthan", color = Color.White, fontSize = 10.sp, fontFamily = FontFamily.Serif)
            }
        }
    }
}

// --- Menu Catalog Screen ---
fun getCurrentAppSeason(): String? {
    val month = java.util.Calendar.getInstance().get(java.util.Calendar.MONTH) + 1
    return when {
        month in 3..6 -> "summer"
        month >= 10 || month <= 2 -> "winter"
        else -> null
    }
}

@Composable
fun CatalogScreen(
    productsList: List<Product>,
    apiBaseUrl: String,
    onProductClick: (Product) -> Unit,
    onAddToCart: (Product) -> Unit,
    onNavigateToScreen: (Screen) -> Unit
) {
    val context = LocalContext.current
    var selectedCategory by remember { mutableStateOf("All") }
    val categories = listOf("All", "Mango", "Green Chili", "Lemon", "Delicacies")

    // Season detection
    val currentSeason = remember { getCurrentAppSeason() }
    val regularProducts = remember(productsList) { productsList.filter { it.season == null } }
    val seasonalProducts = remember(productsList, currentSeason) {
        if (currentSeason != null) productsList.filter { it.season == currentSeason } else emptyList()
    }
    val pantryProducts = remember(productsList) { productsList.filter { it.season == "pantry" } }

    Column(modifier = Modifier.fillMaxSize().background(Color(0xFFFFFFFF))) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(vertical = 12.dp, horizontal = 8.dp)
        ) {
            categories.forEach { cat ->
                val isSelected = selectedCategory == cat
                Button(
                    onClick = { selectedCategory = cat },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSelected) Color(0xFF9A2C2C) else Color(0xFFF5F5F5),
                        contentColor = if (isSelected) Color.White else Color(0xFF1A1A1A)
                    ),
                    modifier = Modifier.padding(horizontal = 4.dp),
                    shape = RoundedCornerShape(0.dp),
                    border = if (!isSelected) BorderStroke(1.dp, Color(0xFFEAEAEA)) else null
                ) {
                    Text(cat, fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        val filteredProducts = if (selectedCategory == "All") {
            regularProducts
        } else {
            regularProducts.filter { product ->
                val name = product.name.lowercase()
                val cat = selectedCategory.lowercase()
                when (cat) {
                    "mango" -> name.contains("keri") || name.contains("mango")
                    "green chili" -> name.contains("mirch") || name.contains("chili")
                    "lemon" -> name.contains("nimbu") || name.contains("lemon")
                    "delicacies" -> name.contains("lehsua") || name.contains("lasuwa") || name.contains("gunda") || name.contains("lasode")
                    else -> true
                }
            }
        }

        if (selectedCategory == "All") {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
            ) {
                FirstTimerBanner(productsList = productsList, onBannerClick = onProductClick)

                HeroSection(
                    onExploreClick = { selectedCategory = "All" },
                    onQuizClick = { onNavigateToScreen(Screen.Quiz) },
                    onClubClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("$apiBaseUrl/subscribe"))
                        try {
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            Toast.makeText(context, "Could not open browser", Toast.LENGTH_SHORT).show()
                        }
                    }
                )

                HeroHighlightBanner(apiBaseUrl = apiBaseUrl, productsList = productsList, onProductClick = onProductClick)

                // Signature Collection Header
                Column(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "SELECTED PRODUCTS",
                        color = Color(0xFF9A2C2C),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "The Signature Collection",
                        fontFamily = FontFamily.Serif,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1A1A1A)
                    )
                    Divider(color = Color(0xFF9A2C2C), thickness = 2.dp, modifier = Modifier.width(40.dp).padding(top = 10.dp))
                }

                val featured = productsList.take(4)
                val featuredChunks = featured.chunked(2)
                featuredChunks.forEach { pair ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        pair.forEach { prod ->
                            Box(modifier = Modifier.weight(1f)) {
                                ProductCard(prod, apiBaseUrl, onProductClick, onAddToCart)
                            }
                        }
                        if (pair.size == 1) {
                            Box(modifier = Modifier.weight(1f))
                        }
                    }
                }

                ProcessWallGallery()

                ProvenanceMapSection()

                BrandStorySection(apiBaseUrl = apiBaseUrl)

                // Full catalog Header
                Column(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "EXPLORE OUR COLLECTION",
                        color = Color(0xFF9A2C2C),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Our Pickles Menu",
                        fontFamily = FontFamily.Serif,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1A1A1A)
                    )
                    Divider(color = Color(0xFF9A2C2C), thickness = 2.dp, modifier = Modifier.width(40.dp).padding(top = 10.dp))
                }

                val productChunks = regularProducts.chunked(2)
                productChunks.forEach { pair ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        pair.forEach { prod ->
                            Box(modifier = Modifier.weight(1f)) {
                                ProductCard(prod, apiBaseUrl, onProductClick, onAddToCart)
                            }
                        }
                        if (pair.size == 1) {
                            Box(modifier = Modifier.weight(1f))
                        }
                    }
                }

                // --- Seasonal Section ---
                if (seasonalProducts.isNotEmpty()) {
                    val seasonLabel = if (currentSeason == "summer") "Summer Specials 🌞" else "❄️ Winter Specials"
                    val seasonBg = if (currentSeason == "summer") Color(0xFFFFF8E7) else Color(0xFFEEF4FB)
                    val seasonBorder = if (currentSeason == "summer") Color(0xFFF5C842) else Color(0xFFA8C8E8)
                    val seasonAccent = if (currentSeason == "summer") Color(0xFFC8860A) else Color(0xFF1A5FA3)
                    val seasonBadge = if (currentSeason == "summer") "SUMMER HARVEST" else "WINTER HARVEST"

                    Spacer(modifier = Modifier.height(8.dp))
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                            .background(seasonBg, RoundedCornerShape(4.dp))
                            .border(1.dp, seasonBorder, RoundedCornerShape(4.dp))
                            .padding(16.dp)
                    ) {
                        // Badge
                        Box(
                            modifier = Modifier
                                .background(seasonAccent, RoundedCornerShape(2.dp))
                                .padding(horizontal = 10.dp, vertical = 3.dp)
                        ) {
                            Text(seasonBadge, color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = seasonLabel,
                            fontFamily = FontFamily.Serif,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1A1A1A)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (currentSeason == "summer") "Rare seasonal varieties available only during the summer harvest."
                                   else "Fresh winter harvest specials — limited batches only.",
                            fontSize = 12.sp,
                            color = Color(0xFF666666)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        val seasonChunks = seasonalProducts.chunked(2)
                        seasonChunks.forEach { pair ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                pair.forEach { prod ->
                                    Box(modifier = Modifier.weight(1f)) {
                                        ProductCard(prod, apiBaseUrl, onProductClick, onAddToCart)
                                    }
                                }
                                if (pair.size == 1) Box(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }

                // --- From Our Pantry Section ---
                if (pantryProducts.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                            .background(Color(0xFFF2F7F0), RoundedCornerShape(4.dp))
                            .border(1.dp, Color(0xFFC8DFC4), RoundedCornerShape(4.dp))
                            .padding(16.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .background(Color(0xFF2E7D32), RoundedCornerShape(2.dp))
                                .padding(horizontal = 10.dp, vertical = 3.dp)
                        ) {
                            Text("FROM OUR PANTRY", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "🌿 From Our Pantry",
                            fontFamily = FontFamily.Serif,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1A1A1A)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Pure stone-ground powders and artisanal spice blends from our Jaipur kitchen.",
                            fontSize = 12.sp,
                            color = Color(0xFF666666)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        val pantryChunks = pantryProducts.chunked(2)
                        pantryChunks.forEach { pair ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                pair.forEach { prod ->
                                    Box(modifier = Modifier.weight(1f)) {
                                        ProductCard(prod, apiBaseUrl, onProductClick, onAddToCart)
                                    }
                                }
                                if (pair.size == 1) Box(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        } else {
            if (filteredProducts.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No pickles available.", color = Color(0xFF666666), fontFamily = FontFamily.Serif)
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredProducts) { product ->
                        ProductCard(product, apiBaseUrl, onProductClick, onAddToCart)
                    }
                }
            }
        }
    }
}

@Composable
fun ProductCard(
    product: Product,
    apiBaseUrl: String,
    onProductClick: (Product) -> Unit,
    onAddToCart: (Product) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(240.dp) // Taller card matching website storefront aspect ratio
            .clickable { onProductClick(product) },
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFFFF)),
        shape = RoundedCornerShape(0.dp), // Square corners matching website
        border = BorderStroke(1.dp, Color(0xFFEAEAEA))
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // 1. Full-size background image or jar placeholder
            if (!product.imageUrl.isNullOrBlank()) {
                val fullUrl = if (product.imageUrl.startsWith("/")) "$apiBaseUrl${product.imageUrl}" else product.imageUrl
                AsyncImage(
                    model = fullUrl,
                    contentDescription = product.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            } else {
                CanvasJarPlaceholder(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color(0xFFFAFAFA))
                        .padding(bottom = 80.dp) // Leave room for bottom overlay
                )
            }

            // Spiciness 🌶️ indicator overlay (Top Right)
            Row(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(8.dp)
                    .background(Color(0xCCFFFFFF), RoundedCornerShape(4.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                repeat(product.spiciness) {
                    Text("🌶️", fontSize = 10.sp)
                }
                if (product.spiciness == 0) {
                    Text("Mild", fontSize = 9.sp, color = Color(0xFF9A2C2C), fontWeight = FontWeight.Bold)
                }
            }

            // 2. Glassmorphic details overlay at bottom of card
            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(8.dp)
                    .background(Color(0xE6FFFFFF), RoundedCornerShape(0.dp)) // Opaque light overlay
                    .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(0.dp))
                    .padding(8.dp)
            ) {
                Text(
                    text = product.name,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A1A1A),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    fontSize = 13.sp
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "₹${product.price}",
                        color = Color(0xFF9A2C2C),
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                    
                    Text(
                        text = if (product.stockStatus == "IN_STOCK") "In Stock" else "Out of Stock",
                        color = if (product.stockStatus == "IN_STOCK") Color(0xFF1B5E20) else Color(0xFF9A2C2C),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Button(
                    onClick = {
                        onAddToCart(product)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A1A1A), contentColor = Color.White),
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = PaddingValues(vertical = 2.dp),
                    shape = RoundedCornerShape(0.dp)
                ) {
                    Text("Add to Cart", fontSize = 11.sp, fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// --- Canvas Drawn Radar Chart ---
@Composable
fun FlavorRadarChart(profile: FlavorProfile, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val center = Offset(size.width / 2f, size.height / 2f)
        val radius = size.width.coerceAtMost(size.height) / 2.5f
        val labels = listOf("Tangy", "Sweet", "Spicy", "Savory", "Salty")
        val values = listOf(profile.tangy, profile.sweet, profile.spicy, profile.savory, profile.salty)
        
        // 1. Draw web concentric circles/pentagons
        for (step in 1..5) {
            val stepRadius = radius * (step / 5f)
            val path = Path()
            for (i in 0 until 5) {
                val angle = Math.toRadians((i * 72 - 90).toDouble())
                val x = (center.x + stepRadius * cos(angle)).toFloat()
                val y = (center.y + stepRadius * sin(angle)).toFloat()
                if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
            }
            path.close()
            drawPath(path, Color(0x1A000000), style = Stroke(width = 1.dp.toPx()))
        }

        // 2. Draw axis lines
        for (i in 0 until 5) {
            val angle = Math.toRadians((i * 72 - 90).toDouble())
            val endX = (center.x + radius * cos(angle)).toFloat()
            val endY = (center.y + radius * sin(angle)).toFloat()
            drawLine(Color(0x1A000000), center, Offset(endX, endY), strokeWidth = 1.dp.toPx())
        }

        // 3. Draw current flavor profile shape
        val fillPath = Path()
        for (i in 0 until 5) {
            val valPercent = values[i].coerceIn(0, 5) / 5f
            val valRadius = radius * valPercent
            val angle = Math.toRadians((i * 72 - 90).toDouble())
            val x = (center.x + valRadius * cos(angle)).toFloat()
            val y = (center.y + valRadius * sin(angle)).toFloat()
            if (i == 0) fillPath.moveTo(x, y) else fillPath.lineTo(x, y)
        }
        fillPath.close()
        
        drawPath(fillPath, Color(0x269A2C2C)) // 15% opacity Deep Maroon fill
        drawPath(fillPath, Color(0xFF9A2C2C), style = Stroke(width = 2.dp.toPx())) // Deep Maroon border
    }
}

// --- Product Details Dialog UI ---
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProductDetailsDialog(
    product: Product,
    apiBaseUrl: String,
    onDismiss: () -> Unit,
    onAddToCart: (Product) -> Unit
) {
    val context = LocalContext.current
    AlertDialog(
        onDismissRequest = onDismiss,
        title = null,
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .background(Color(0xFFFAFAFA), RoundedCornerShape(0.dp))
                        .border(1.dp, Color(0xFFEAEAEA))
                ) {
                    if (!product.imageUrl.isNullOrBlank()) {
                        val fullUrl = if (product.imageUrl.startsWith("/")) "$apiBaseUrl${product.imageUrl}" else product.imageUrl
                        AsyncImage(
                            model = fullUrl,
                            contentDescription = product.name,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        CanvasJarPlaceholder(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(12.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = product.name,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 22.sp,
                    color = Color(0xFF1A1A1A),
                    textAlign = TextAlign.Center
                )

                Text(
                    text = "Category: ${product.category} | ${product.batchNumber}",
                    fontSize = 12.sp,
                    color = Color(0xFF666666),
                    fontFamily = FontFamily.Serif
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = product.description,
                    fontSize = 14.sp,
                    color = Color(0xFF1A1A1A),
                    textAlign = TextAlign.Center,
                    lineHeight = 20.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Canvas Flavor Radar Chart
                Text(
                    text = "Flavor Profile Radar",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Color(0xFF9A2C2C),
                    fontFamily = FontFamily.Serif
                )
                
                FlavorRadarChart(
                    profile = product.flavorProfile,
                    modifier = Modifier
                        .size(160.dp)
                        .padding(top = 8.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text("Spiciness: ", fontSize = 13.sp, color = Color(0xFF1A1A1A))
                    repeat(product.spiciness) { Text("🌶️", fontSize = 12.sp) }
                    if (product.spiciness == 0) Text("Sweet (No spice)", fontSize = 13.sp, color = Color(0xFF1A1A1A))
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "₹${product.price} (Standard Jar)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    color = Color(0xFF9A2C2C),
                    fontFamily = FontFamily.Serif
                )
            }
        },
        confirmButton = {
            Column(modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = { onAddToCart(product) },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(0.dp)
                ) {
                    Text("Add to Cart", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                }
                
                Spacer(modifier = Modifier.height(8.dp))

                // WhatsApp Ordering directly (works offline as WhatsApp queues messages)
                Button(
                    onClick = {
                        val message = "Hello Aunty! I would like to order: ${product.name} (x1) - ₹${product.price}. Please confirm."
                        val encoded = Uri.encode(message)
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/919876543210?text=$encoded"))
                        try {
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            Toast.makeText(context, "WhatsApp is not installed", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366), contentColor = Color.White),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(0.dp)
                ) {
                    Text("Order via WhatsApp", color = Color.White, fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, modifier = Modifier.fillMaxWidth()) {
                Text("Close", color = Color(0xFF666666), textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth(), fontFamily = FontFamily.Serif)
            }
        },
        containerColor = Color(0xFFFFFFFF)
    )
}

// --- Cart Sheet ---
@Composable
fun CartSheetContent(
    cartItems: List<CartItem>,
    isGiftOrder: Boolean,
    giftWrapType: String,
    giftMessageText: String,
    onGiftChange: (Boolean) -> Unit,
    onGiftWrapChange: (String) -> Unit,
    onGiftMessageChange: (String) -> Unit,
    onCheckoutClick: () -> Unit,
    onRemove: (CartItem) -> Unit,
    onUpdateQuantity: (CartItem, Int) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
    ) {
        // ── Elegant header ──────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "Your Jars Selection",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp,
                    color = Color(0xFF1A1A1A)
                )
                if (cartItems.isNotEmpty()) {
                    Text(
                        text = "${cartItems.sumOf { it.quantity }} item${if (cartItems.sumOf { it.quantity } > 1) "s" else ""}",
                        fontFamily = FontFamily.Serif,
                        fontSize = 13.sp,
                        color = Color(0xFF888888)
                    )
                }
            }
            // item count badge
            if (cartItems.isNotEmpty()) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Color(0xFF9A2C2C)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = cartItems.sumOf { it.quantity }.toString(),
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }

        HorizontalDivider(color = Color(0x14000000), thickness = 1.dp)

        if (cartItems.isEmpty()) {
            // ── Empty state ─────────────────────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 60.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "\uD83C\uDF36\uFE0F",
                    fontSize = 48.sp
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Your basket is empty",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = Color(0xFF1A1A1A)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Add some artisanal Jaipur pickles\nto start your culinary journey.",
                    fontFamily = FontFamily.Serif,
                    fontSize = 13.sp,
                    color = Color(0xFF888888),
                    textAlign = TextAlign.Center
                )
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f, fill = false)
                    .verticalScroll(rememberScrollState())
            ) {
                // ── Cart item rows ───────────────────────────────────
                cartItems.forEach { item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Product image thumbnail
                        Box(
                            modifier = Modifier
                                .size(70.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .border(1.dp, Color(0x0D000000), RoundedCornerShape(4.dp))
                                .background(Color(0xFFF7F3EE)),
                            contentAlignment = Alignment.Center
                        ) {
                            if (item.product.imageUrl != null) {
                                AsyncImage(
                                    model = item.product.imageUrl,
                                    contentDescription = item.product.name,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                CanvasJarPlaceholder(modifier = Modifier.size(50.dp))
                            }
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        // Name + price
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = item.product.name,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 15.sp,
                                color = Color(0xFF1A1A1A)
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "₹${item.product.price.toInt()}",
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Color(0xFF9A2C2C)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            // Qty controls — website style bordered pill
                            Row(
                                modifier = Modifier
                                    .border(1.dp, Color(0xFFDDDDDD), RoundedCornerShape(2.dp)),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                TextButton(
                                    onClick = { onUpdateQuantity(item, item.quantity - 1) },
                                    modifier = Modifier.size(28.dp),
                                    contentPadding = PaddingValues(0.dp)
                                ) {
                                    Text(
                                        text = if (item.quantity == 1) "\u2715" else "\u2212",
                                        fontSize = 14.sp,
                                        color = Color(0xFF444444),
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Text(
                                    text = "${item.quantity}",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp,
                                    color = Color(0xFF1A1A1A),
                                    modifier = Modifier.padding(horizontal = 10.dp)
                                )
                                TextButton(
                                    onClick = { onUpdateQuantity(item, item.quantity + 1) },
                                    modifier = Modifier.size(28.dp),
                                    contentPadding = PaddingValues(0.dp)
                                ) {
                                    Text(
                                        text = "\u002B",
                                        fontSize = 14.sp,
                                        color = Color(0xFF444444),
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                        // Remove button
                        IconButton(onClick = { onRemove(item) }) {
                            Text(
                                text = "\u2715",
                                fontSize = 16.sp,
                                color = Color(0xFFAAAAAA)
                            )
                        }
                    }
                    HorizontalDivider(color = Color(0x0A000000), thickness = 1.dp, modifier = Modifier.padding(horizontal = 24.dp))
                }

                Spacer(modifier = Modifier.height(16.dp))

                // ── Gift Box toggle ──────────────────────────────────
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFBF8F5)),
                    border = BorderStroke(1.dp, Color(0xFFEEE5DC)),
                    shape = RoundedCornerShape(0.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Checkbox(
                                checked = isGiftOrder,
                                onCheckedChange = onGiftChange,
                                colors = CheckboxDefaults.colors(checkedColor = Color(0xFF9A2C2C))
                            )
                            Column {
                                Text(
                                    text = "\uD83C\uDF81  Make this a Gift Box",
                                    fontFamily = FontFamily.Serif,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 14.sp,
                                    color = Color(0xFF1A1A1A)
                                )
                                Text(
                                    text = "Premium Rajasthani gifting options",
                                    fontFamily = FontFamily.Serif,
                                    fontSize = 11.sp,
                                    color = Color(0xFF888888)
                                )
                            }
                        }

                        if (isGiftOrder) {
                            Spacer(modifier = Modifier.height(10.dp))
                            HorizontalDivider(color = Color(0x14000000))
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "PACKAGING",
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                letterSpacing = 1.5.sp,
                                color = Color(0xFF888888)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            listOf(
                                Pair("cloth", "Cotton Potli Wrap  (+₹0)"),
                                Pair("wood",  "Premium Wooden Crate  (+₹150)")
                            ).forEach { (key, label) ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { onGiftWrapChange(key) }
                                        .padding(vertical = 4.dp)
                                ) {
                                    RadioButton(
                                        selected = giftWrapType == key,
                                        onClick = { onGiftWrapChange(key) },
                                        colors = RadioButtonDefaults.colors(selectedColor = Color(0xFF9A2C2C))
                                    )
                                    Text(
                                        text = label,
                                        fontFamily = FontFamily.Serif,
                                        fontSize = 13.sp,
                                        color = Color(0xFF1A1A1A)
                                    )
                                }
                            }
                            OutlinedTextField(
                                value = giftMessageText,
                                onValueChange = onGiftMessageChange,
                                label = { Text("Gift Message (Optional)", fontFamily = FontFamily.Serif) },
                                maxLines = 3,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Color(0xFF9A2C2C),
                                    focusedLabelColor = Color(0xFF9A2C2C),
                                    unfocusedBorderColor = Color(0xFFDDDDDD)
                                ),
                                modifier = Modifier.fillMaxWidth().padding(top = 10.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // ── Order summary ────────────────────────────────────
                val baseTotal = cartItems.sumOf { it.product.price * it.quantity }
                val packagingCost = if (isGiftOrder && giftWrapType == "wood") 150.0 else 0.0
                val grandTotal = baseTotal + packagingCost

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                ) {
                    Text(
                        text = "ORDER SUMMARY",
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp,
                        letterSpacing = 1.5.sp,
                        color = Color(0xFF888888)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Subtotal", fontFamily = FontFamily.Serif, fontSize = 14.sp, color = Color(0xFF555555))
                        Text("₹${baseTotal.toInt()}", fontFamily = FontFamily.Serif, fontSize = 14.sp, color = Color(0xFF1A1A1A))
                    }
                    if (packagingCost > 0) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Wooden Crate", fontFamily = FontFamily.Serif, fontSize = 14.sp, color = Color(0xFF555555))
                            Text("₹150", fontFamily = FontFamily.Serif, fontSize = 14.sp, color = Color(0xFF1A1A1A))
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Shipping", fontFamily = FontFamily.Serif, fontSize = 14.sp, color = Color(0xFF555555))
                        Text(
                            text = "FREE",
                            fontFamily = FontFamily.Serif,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2E7D32)
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    HorizontalDivider(color = Color(0x14000000))
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Total",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = Color(0xFF1A1A1A)
                        )
                        Text(
                            text = "₹${grandTotal.toInt()}",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 22.sp,
                            color = Color(0xFF9A2C2C)
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "\u267B\uFE0F  Free Pan-India Shipping & COD available",
                        fontFamily = FontFamily.Serif,
                        fontSize = 11.sp,
                        color = Color(0xFF2E7D32),
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // ── CTA Buttons ──────────────────────────────────────
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                ) {
                    Button(
                        onClick = onCheckoutClick,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF9A2C2C),
                            contentColor = Color.White
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(0.dp)
                    ) {
                        Text(
                            text = "SECURE CHECKOUT  \u2192",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            letterSpacing = 0.8.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedButton(
                        onClick = { /* already in app */ },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp),
                        shape = RoundedCornerShape(0.dp),
                        border = BorderStroke(1.dp, Color(0xFFCCCCCC)),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF1A1A1A))
                    ) {
                        Text(
                            text = "Continue Shopping",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Medium,
                            fontSize = 13.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

// --- Checkout Screen Dialog (Allows fully offline options) ---
@Composable
fun CheckoutScreen(
    cartItems: List<CartItem>,
    isGiftOrder: Boolean,
    giftWrapType: String,
    giftMessageText: String,
    apiBaseUrl: String,
    isOffline: Boolean,
    onDismiss: () -> Unit,
    onOrderSuccess: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var altPhone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var landmark by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("Jaipur") }
    var state by remember { mutableStateOf("Rajasthan") }
    var pincode by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var couponCode by remember { mutableStateOf("") }
    
    var isSubmitting by remember { mutableStateOf(false) }

    val baseTotal = cartItems.sumOf { it.product.price * it.quantity }
    val packagingCost = if (isGiftOrder && giftWrapType == "wood") 150.0 else 0.0
    val grandTotal = baseTotal + packagingCost

    val textFieldColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = Color(0xFF9A2C2C),
        focusedLabelColor = Color(0xFF9A2C2C)
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFFFFFF))
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                IconButton(onClick = onDismiss) {
                    Text("⬅️", fontSize = 20.sp)
                }
                Text("Checkout Details", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1A1A1A), fontFamily = FontFamily.Serif)
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (isOffline) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF3E0)),
                    border = BorderStroke(1.dp, Color(0xFFFFB74D)),
                    shape = RoundedCornerShape(0.dp),
                    modifier = Modifier.padding(bottom = 12.dp)
                ) {
                    Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("⚠️", fontSize = 20.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "You are currently offline. You can place the order via WhatsApp (doesn't require internet) or connect to sync.",
                            color = Color(0xFFE65100),
                            fontSize = 13.sp,
                            fontFamily = FontFamily.Serif
                        )
                    }
                }
            }

            // Input Fields
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Name") },
                singleLine = true,
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
            )

            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Phone Number") },
                singleLine = true,
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
            )

            OutlinedTextField(
                value = altPhone,
                onValueChange = { altPhone = it },
                label = { Text("Alternative Phone (Optional)") },
                singleLine = true,
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
            )

            OutlinedTextField(
                value = address,
                onValueChange = { address = it },
                label = { Text("Full Delivery Address") },
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().height(100.dp).padding(vertical = 4.dp)
            )

            OutlinedTextField(
                value = landmark,
                onValueChange = { landmark = it },
                label = { Text("Landmark (Optional)") },
                singleLine = true,
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
            )

            Row {
                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = { Text("City") },
                    singleLine = true,
                    colors = textFieldColors,
                    modifier = Modifier.weight(1f).padding(end = 4.dp)
                )
                OutlinedTextField(
                    value = state,
                    onValueChange = { state = it },
                    label = { Text("State") },
                    singleLine = true,
                    colors = textFieldColors,
                    modifier = Modifier.weight(1f).padding(start = 4.dp)
                )
            }

            OutlinedTextField(
                value = pincode,
                onValueChange = { pincode = it },
                label = { Text("Pincode") },
                singleLine = true,
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
            )

            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("Delivery Instructions / Notes") },
                colors = textFieldColors,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text("Order Summary", fontWeight = FontWeight.Bold, color = Color(0xFF1A1A1A), fontFamily = FontFamily.Serif, fontSize = 16.sp)
            Spacer(modifier = Modifier.height(8.dp))
            cartItems.forEach {
                Text("• ${it.product.name} (x${it.quantity}) - ₹${it.product.price * it.quantity}", color = Color(0xFF666666), fontSize = 14.sp)
            }
            if (isGiftOrder) {
                Text("• Gift Wrapping (${giftWrapType.uppercase()}) - ₹$packagingCost", color = Color(0xFF666666), fontSize = 14.sp)
            }
            Text("Grand Total: ₹$grandTotal", color = Color(0xFF9A2C2C), fontWeight = FontWeight.Bold, fontFamily = FontFamily.Serif, fontSize = 16.sp, modifier = Modifier.padding(top = 4.dp))

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons
            if (isOffline) {
                Button(
                    onClick = {
                        val orderList = cartItems.joinToString("\n") { "• ${it.product.name} × ${it.quantity}" }
                        val wrapText = if (isGiftOrder) "\n🎁 Gift wrapping selected: $giftWrapType" else ""
                        val waMsg = """
                            🛒 New Order Request (Offline App)
                            Name: $name
                            Phone: $phone
                            Address: $address, $landmark, $city, $state - $pincode
                            Items:
                            $orderList$wrapText
                            Total: ₹$grandTotal (COD)
                            Notes: $notes
                        """.trimIndent()
                        val encoded = Uri.encode(waMsg)
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/919876543210?text=$encoded"))
                        try {
                            context.startActivity(intent)
                            onOrderSuccess()
                        } catch (e: Exception) {
                            Toast.makeText(context, "WhatsApp is not installed", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366), contentColor = Color.White),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(0.dp)
                ) {
                    Text("Place Order on WhatsApp", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                }
            } else {
                Button(
                    onClick = {
                        if (name.isBlank() || phone.isBlank() || address.isBlank() || pincode.isBlank()) {
                            Toast.makeText(context, "Please fill in all required fields", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        
                        isSubmitting = true
                        scope.launch {
                            try {
                                val success = submitOrderToServer(
                                    apiUrl = apiBaseUrl,
                                    name = name,
                                    phone = phone,
                                    altPhone = altPhone,
                                    address = address,
                                    landmark = landmark,
                                    city = city,
                                    state = state,
                                    pincode = pincode,
                                    notes = notes,
                                    totalAmount = grandTotal,
                                    cartItems = cartItems,
                                    isGift = isGiftOrder,
                                    giftMsg = giftMessageText,
                                    giftWrap = giftWrapType
                                )
                                if (success) {
                                    onOrderSuccess()
                                } else {
                                    Toast.makeText(context, "Failed to submit order, please retry", Toast.LENGTH_SHORT).show()
                                }
                            } catch (e: Exception) {
                                Toast.makeText(context, "Network Error: ${e.message}", Toast.LENGTH_SHORT).show()
                            } finally {
                                isSubmitting = false
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isSubmitting,
                    shape = RoundedCornerShape(0.dp)
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    } else {
                        Text("Place COD Order", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// Submit Order via POST API
suspend fun submitOrderToServer(
    apiUrl: String,
    name: String,
    phone: String,
    altPhone: String,
    address: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
    notes: String,
    totalAmount: Double,
    cartItems: List<CartItem>,
    isGift: Boolean,
    giftMsg: String,
    giftWrap: String
): Boolean = withContext(Dispatchers.IO) {
    try {
        val url = URL("$apiUrl/api/orders")
        val conn = url.openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.setRequestProperty("Content-Type", "application/json")
        conn.doOutput = true
        conn.connectTimeout = 5000
        conn.readTimeout = 5000

        val orderObj = JSONObject().apply {
            put("customerName", name)
            put("phone", phone)
            put("altPhone", if (altPhone.isNotBlank()) altPhone else null)
            put("address", address)
            put("landmark", if (landmark.isNotBlank()) landmark else null)
            put("city", city)
            put("state", state)
            put("pincode", pincode)
            put("notes", if (notes.isNotBlank()) notes else null)
            put("totalAmount", totalAmount)
            put("isGiftOrder", isGift)
            put("giftMessage", if (isGift && giftMsg.isNotBlank()) giftMsg else null)
            put("giftPackaging", if (isGift) giftWrap else null)

            val itemsArr = JSONArray()
            cartItems.forEach {
                val itemObj = JSONObject().apply {
                    put("productId", it.product.id)
                    put("quantity", it.quantity)
                    put("price", it.product.price)
                }
                itemsArr.put(itemObj)
            }
            put("items", itemsArr)
        }

        val writer = OutputStreamWriter(conn.outputStream)
        writer.write(orderObj.toString())
        writer.flush()
        writer.close()

        val responseCode = conn.responseCode
        responseCode == 201 || responseCode == 200
    } catch (e: Exception) {
        e.printStackTrace()
        false
    }
}

// --- Tab 2: Onboarding Flavor Quiz Screen ---
@Composable
fun OnboardingQuizScreen(productsList: List<Product>, onSelectRecommended: (Product) -> Unit) {
    var step by remember { mutableStateOf(1) }
    var prefSpice by remember { mutableStateOf(2) } // 1: Mild, 2: Medium, 3: Spicy
    var prefSweetSour by remember { mutableStateOf("sour") } // "sweet" or "sour" or "both"
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFFFFFF))
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFAFAFA)),
                border = BorderStroke(1.dp, Color(0xFFEAEAEA)),
                shape = RoundedCornerShape(0.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "Aunty's Flavor Finder",
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 22.sp,
                        color = Color(0xFF9A2C2C)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))

                    when (step) {
                        1 -> {
                            Text("Step 1: Select your preferred spiciness level:", color = Color(0xFF1A1A1A), textAlign = TextAlign.Center, fontFamily = FontFamily.Serif)
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { prefSpice = 1; step = 2 },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF5F5F5), contentColor = Color(0xFF1A1A1A)),
                                shape = RoundedCornerShape(0.dp),
                                border = BorderStroke(1.dp, Color(0xFFEAEAEA)),
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                            ) { Text("🌶️ Mild / Sweet-Spicy", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold) }
                            Button(
                                onClick = { prefSpice = 2; step = 2 },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
                                shape = RoundedCornerShape(0.dp),
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                            ) { Text("🌶️🌶️ Medium Hot", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold) }
                            Button(
                                onClick = { prefSpice = 3; step = 2 },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828), contentColor = Color.White),
                                shape = RoundedCornerShape(0.dp),
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                            ) { Text("🌶️🌶️🌶️ Extra Hot", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold) }
                        }
                        2 -> {
                            Text("Step 2: Do you prefer Sweet or Sour pickle profiles?", color = Color(0xFF1A1A1A), textAlign = TextAlign.Center, fontFamily = FontFamily.Serif)
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { prefSweetSour = "sour"; step = 3 },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
                                shape = RoundedCornerShape(0.dp),
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                            ) { Text("Tangy & Sour", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold) }
                            Button(
                                onClick = { prefSweetSour = "sweet"; step = 3 },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
                                shape = RoundedCornerShape(0.dp),
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                            ) { Text("Sweet & Sour / Gur-Based", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold) }
                            Button(
                                onClick = { prefSweetSour = "both"; step = 3 },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
                                shape = RoundedCornerShape(0.dp),
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                            ) { Text("Balanced / Both", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold) }
                        }
                        3 -> {
                            val matches = productsList.filter {
                                (it.spiciness == prefSpice || it.spiciness == prefSpice - 1 || it.spiciness == prefSpice + 1) &&
                                (if (prefSweetSour == "sour") it.flavorProfile.tangy >= 3 else if (prefSweetSour == "sweet") it.flavorProfile.sweet >= 3 else true)
                            }
                            val bestMatch = matches.firstOrNull() ?: productsList.firstOrNull()

                            Text("Aunty's Personal Recommendation for you:", color = Color(0xFF1A1A1A), fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold)
                            Spacer(modifier = Modifier.height(12.dp))
                            
                            if (bestMatch != null) {
                                CanvasJarPlaceholder(modifier = Modifier.size(80.dp))
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(bestMatch.name, fontWeight = FontWeight.Bold, color = Color(0xFF9A2C2C), fontSize = 18.sp, fontFamily = FontFamily.Serif)
                                Text(bestMatch.description, color = Color(0xFF666666), fontSize = 13.sp, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 4.dp))
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                Button(
                                    onClick = { onSelectRecommended(bestMatch) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
                                    shape = RoundedCornerShape(0.dp)
                                ) {
                                    Text("View Details & Add", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                                }
                            } else {
                                Text("No matching products found.", color = Color(0xFF666666), fontFamily = FontFamily.Serif)
                            }
                            
                            Spacer(modifier = Modifier.height(12.dp))
                            TextButton(onClick = { step = 1 }) {
                                Text("Retake Quiz", color = Color(0xFF666666), fontFamily = FontFamily.Serif)
                            }
                        }
                    }
                }
            }
        }
    }
}

// --- Tab 3: Passport stamp book ---
@Composable
fun PassportScreen(productsList: List<Product>) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFFFFFF))
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Your Achar Passport", fontFamily = FontFamily.Serif, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF9A2C2C))
        Text("Try all flavors to claim a free premium jar from Aunty!", fontSize = 12.sp, color = Color(0xFF666666), fontFamily = FontFamily.Serif)

        Spacer(modifier = Modifier.height(20.dp))

        // Grid showing stamps book
        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            modifier = Modifier.height(300.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(productsList) { prod ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFFFF)),
                    border = BorderStroke(1.dp, Color(0xFFEAEAEA)),
                    shape = RoundedCornerShape(0.dp)
                ) {
                    Box(modifier = Modifier.padding(8.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CanvasJarPlaceholder(modifier = Modifier.size(40.dp))
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(prod.name.split(" ").firstOrNull() ?: "", fontSize = 10.sp, color = Color(0xFF1A1A1A), maxLines = 1, overflow = TextOverflow.Ellipsis, fontFamily = FontFamily.Serif)
                            
                            // Mocking stamp progress: Stamp Keri Ka Khatta by default as a starter stamp!
                            if (prod.id == "1") {
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .background(Color(0x339A2C2C), RoundedCornerShape(12.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("✅", fontSize = 12.sp)
                                }
                            } else {
                                Text("LOCKED", fontSize = 8.sp, color = Color(0xFF999999), fontWeight = FontWeight.Bold, fontFamily = FontFamily.Serif)
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFAFAFA)),
            border = BorderStroke(1.dp, Color(0xFFEAEAEA)),
            shape = RoundedCornerShape(0.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Stamps Unlocked: 1 / ${productsList.size}", color = Color(0xFF1A1A1A), fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif)
                Spacer(modifier = Modifier.height(4.dp))
                LinearProgressIndicator(
                    progress = 1f / productsList.size.coerceAtLeast(1),
                    color = Color(0xFF9A2C2C),
                    trackColor = Color(0xFFEAEAEA),
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp))
                )
            }
        }
    }
}

// --- Tab 4: Returns screen ---
@Composable
fun ReturnsScreen(apiUrl: String, isOffline: Boolean) {
    val context = LocalContext.current
    var jarsCount by remember { mutableStateOf("5") }
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }

    val textFieldColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = Color(0xFF9A2C2C),
        focusedLabelColor = Color(0xFF9A2C2C)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFFFFFF))
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Glass Jar Return Program", fontFamily = FontFamily.Serif, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF9A2C2C), textAlign = TextAlign.Center)
        Text("Return 5 or more empty jars and get ₹100 flat store credit on your next jar purchase!", fontSize = 13.sp, color = Color(0xFF666666), textAlign = TextAlign.Center, modifier = Modifier.padding(top = 4.dp), fontFamily = FontFamily.Serif)

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Name") },
            singleLine = true,
            colors = textFieldColors,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("Phone Number") },
            singleLine = true,
            colors = textFieldColors,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = jarsCount,
            onValueChange = { jarsCount = it },
            label = { Text("Number of Jars (Min. 5)") },
            singleLine = true,
            colors = textFieldColors,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = address,
            onValueChange = { address = it },
            label = { Text("Pickup Address") },
            colors = textFieldColors,
            modifier = Modifier.fillMaxWidth().height(100.dp)
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = {
                val jars = jarsCount.toIntOrNull() ?: 0
                if (jars < 5) {
                    Toast.makeText(context, "Minimum 5 jars required to claim credit", Toast.LENGTH_SHORT).show()
                    return@Button
                }
                
                val waMsg = """
                    ♻️ Empty Jar Return Pickup Request
                    Name: $name
                    Phone: $phone
                    Jars Count: $jars
                    Pickup Address: $address
                """.trimIndent()
                val encoded = Uri.encode(waMsg)
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/919876543210?text=$encoded"))
                try {
                    context.startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(context, "WhatsApp is not installed", Toast.LENGTH_SHORT).show()
                }
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
            shape = RoundedCornerShape(0.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Request Return Pickup", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
        }
    }
}

// --- Tab 5: Story/Diary screen ---
@Composable
fun DiaryScreen() {
    val stories = listOf(
        Pair("Sourcing Raw Keri (Mangoes)", "We source our Keri (Mangoes) raw directly from orchards in Chomu, Jaipur. They are checked for firm pulp and perfect tanginess to withstand solar curing."),
        Pair("Sun Drying under Jaipur Sun", "Our spices are ground locally, mixed with sun-dried mango slices, and layered in glass jars. They are cured on terrace stands under direct sunlight for 14-21 days."),
        Pair("Traditional Mustard Oil Layering", "Pure mustard oil is heated, cooled, and layered over cured pickles. This seals in flavor and naturally preserves the pickle for years without synthetic agents.")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFFFFFF))
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text("Aunty's Diary", fontFamily = FontFamily.Serif, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF9A2C2C), modifier = Modifier.padding(bottom = 12.dp))
        
        stories.forEach { story ->
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFFFF)),
                border = BorderStroke(1.dp, Color(0xFFEAEAEA)),
                shape = RoundedCornerShape(0.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(story.first, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1A1A1A), fontFamily = FontFamily.Serif)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(story.second, color = Color(0xFF666666), fontSize = 14.sp, lineHeight = 20.sp, fontFamily = FontFamily.Serif)
                }
            }
        }
    }
}

// --- Admin Section Helpers ---
// --- Shared admin auth helper: POSTs to /api/admin/login and returns the session cookie string ---
fun getAdminCookie(apiBaseUrl: String): String {
    val loginUrl = URL("$apiBaseUrl/api/admin/login")
    val loginConn = loginUrl.openConnection() as HttpURLConnection
    loginConn.requestMethod = "POST"
    loginConn.setRequestProperty("Content-Type", "application/json")
    loginConn.doOutput = true
    loginConn.connectTimeout = 10000
    loginConn.readTimeout = 10000
    val loginWriter = OutputStreamWriter(loginConn.outputStream)
    loginWriter.write(JSONObject().apply { put("password", "achar-admin") }.toString())
    loginWriter.flush()
    loginWriter.close()
    val code = loginConn.responseCode
    if (code != 200) throw Exception("Admin auth failed: $code")
    return loginConn.headerFields["Set-Cookie"]
        ?.joinToString("; ") { it.split(";")[0] }
        ?: throw Exception("No session cookie returned from login")
}

fun loadDashboardData(
    apiBaseUrl: String,
    onSuccess: (JSONObject) -> Unit,
    onError: (String) -> Unit
) {
    CoroutineScope(Dispatchers.Main).launch {
        try {
            val result = withContext(Dispatchers.IO) {
                // Step 1: POST to /api/admin/login to obtain the httpOnly session cookie
                val loginUrl = URL("$apiBaseUrl/api/admin/login")
                val loginConn = loginUrl.openConnection() as HttpURLConnection
                loginConn.requestMethod = "POST"
                loginConn.setRequestProperty("Content-Type", "application/json")
                loginConn.doOutput = true
                loginConn.connectTimeout = 10000
                loginConn.readTimeout = 10000
                val loginBody = JSONObject().apply { put("password", "achar-admin") }
                val loginWriter = OutputStreamWriter(loginConn.outputStream)
                loginWriter.write(loginBody.toString())
                loginWriter.flush()
                loginWriter.close()
                val loginCode = loginConn.responseCode
                if (loginCode != 200) throw Exception("Auth failed: $loginCode")
                // Extract Set-Cookie header
                val setCookie = loginConn.headerFields["Set-Cookie"]
                    ?.joinToString("; ") { it.split(";")[0] }
                    ?: throw Exception("No session cookie returned")

                // Step 2: GET the dashboard using the session cookie
                val dashUrl = URL("$apiBaseUrl/api/admin/dashboard")
                val dashConn = dashUrl.openConnection() as HttpURLConnection
                dashConn.requestMethod = "GET"
                dashConn.setRequestProperty("Cookie", setCookie)
                dashConn.connectTimeout = 10000
                dashConn.readTimeout = 10000
                val code = dashConn.responseCode
                if (code == 200) {
                    val reader = BufferedReader(InputStreamReader(dashConn.inputStream))
                    val sb = StringBuilder()
                    var line: String?
                    while (reader.readLine().also { line = it } != null) { sb.append(line) }
                    reader.close()
                    JSONObject(sb.toString())
                } else {
                    val errReader = BufferedReader(InputStreamReader(dashConn.errorStream ?: dashConn.inputStream))
                    val errSb = StringBuilder()
                    var errLine: String?
                    while (errReader.readLine().also { errLine = it } != null) { errSb.append(errLine) }
                    throw Exception("Server returned code $code: $errSb")
                }
            }
            onSuccess(result)
        } catch (e: Exception) {
            e.printStackTrace()
            onError(e.message ?: "Unknown Error")
        }
    }
}

fun updateOrderStatus(
    apiBaseUrl: String,
    orderId: String,
    newStatus: String,
    onSuccess: () -> Unit,
    onError: (String) -> Unit
) {
    CoroutineScope(Dispatchers.Main).launch {
        try {
            val success = withContext(Dispatchers.IO) {
                val cookie = getAdminCookie(apiBaseUrl)
                val url = URL("$apiBaseUrl/api/admin/orders/$orderId")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "PATCH"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Cookie", cookie)
                connection.doOutput = true
                connection.connectTimeout = 10000
                connection.readTimeout = 10000
                val body = JSONObject().apply { put("status", newStatus) }
                val writer = OutputStreamWriter(connection.outputStream)
                writer.write(body.toString())
                writer.flush()
                writer.close()
                connection.responseCode == 200
            }
            if (success) onSuccess() else onError("Failed to update status")
        } catch (e: Exception) {
            e.printStackTrace()
            onError(e.message ?: "Unknown Error")
        }
    }
}

fun claimPassport(
    apiBaseUrl: String,
    phone: String,
    onSuccess: () -> Unit,
    onError: (String) -> Unit
) {
    CoroutineScope(Dispatchers.Main).launch {
        try {
            val success = withContext(Dispatchers.IO) {
                val cookie = getAdminCookie(apiBaseUrl)
                val url = URL("$apiBaseUrl/api/admin/claim-passport")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Cookie", cookie)
                connection.doOutput = true
                connection.connectTimeout = 10000
                connection.readTimeout = 10000
                val body = JSONObject().apply { put("phone", phone) }
                val writer = OutputStreamWriter(connection.outputStream)
                writer.write(body.toString())
                writer.flush()
                writer.close()
                connection.responseCode == 200
            }
            if (success) onSuccess() else onError("Failed to claim passport")
        } catch (e: Exception) {
            e.printStackTrace()
            onError(e.message ?: "Unknown Error")
        }
    }
}

fun upsertProduct(
    apiBaseUrl: String,
    productId: String?,
    productData: JSONObject,
    onSuccess: () -> Unit,
    onError: (String) -> Unit
) {
    CoroutineScope(Dispatchers.Main).launch {
        try {
            val success = withContext(Dispatchers.IO) {
                val cookie = getAdminCookie(apiBaseUrl)
                val url = if (productId == null) URL("$apiBaseUrl/api/admin/products")
                           else URL("$apiBaseUrl/api/admin/products/$productId")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = if (productId == null) "POST" else "PATCH"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Cookie", cookie)
                connection.doOutput = true
                connection.connectTimeout = 10000
                connection.readTimeout = 10000
                val writer = OutputStreamWriter(connection.outputStream)
                writer.write(productData.toString())
                writer.flush()
                writer.close()
                connection.responseCode == 200 || connection.responseCode == 201
            }
            if (success) onSuccess() else onError("Failed to submit product data")
        } catch (e: Exception) {
            e.printStackTrace()
            onError(e.message ?: "Unknown Error")
        }
    }
}

fun deleteProduct(
    apiBaseUrl: String,
    productId: String,
    onSuccess: () -> Unit,
    onError: (String) -> Unit
) {
    CoroutineScope(Dispatchers.Main).launch {
        try {
            val success = withContext(Dispatchers.IO) {
                val cookie = getAdminCookie(apiBaseUrl)
                val url = URL("$apiBaseUrl/api/admin/products/$productId")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "DELETE"
                connection.setRequestProperty("Cookie", cookie)
                connection.connectTimeout = 10000
                connection.readTimeout = 10000
                connection.responseCode == 200
            }
            if (success) onSuccess() else onError("Failed to delete product")
        } catch (e: Exception) {
            e.printStackTrace()
            onError(e.message ?: "Unknown Error")
        }
    }
}

fun uploadDispatchPhoto(
    context: Context,
    apiBaseUrl: String,
    orderId: String,
    imageUri: Uri,
    onSuccess: () -> Unit,
    onError: (String) -> Unit
) {
    CoroutineScope(Dispatchers.Main).launch {
        try {
            val result = withContext(Dispatchers.IO) {
                val cookie = getAdminCookie(apiBaseUrl)
                val boundary = "Boundary-${System.currentTimeMillis()}"
                val lineEnd = "\r\n"
                val twoHyphens = "--"
                
                val url = URL("$apiBaseUrl/api/admin/orders/$orderId/dispatch-photo")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.doOutput = true
                connection.setRequestProperty("Connection", "Keep-Alive")
                connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
                connection.setRequestProperty("Cookie", cookie)
                connection.connectTimeout = 15000
                connection.readTimeout = 15000
                
                val outputStream = DataOutputStream(connection.outputStream)
                
                val contentResolver = context.contentResolver
                val inputStream = contentResolver.openInputStream(imageUri) ?: throw Exception("Failed to open stream")
                
                var fileName = "photo.jpg"
                val cursor = contentResolver.query(imageUri, null, null, null, null)
                cursor?.use {
                    if (it.moveToFirst()) {
                        val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                        if (nameIndex != -1) {
                            fileName = it.getString(nameIndex)
                        }
                    }
                }
                
                outputStream.writeBytes(twoHyphens + boundary + lineEnd)
                outputStream.writeBytes("Content-Disposition: form-data; name=\"file\"; filename=\"$fileName\"$lineEnd")
                outputStream.writeBytes("Content-Type: image/jpeg$lineEnd$lineEnd")
                
                val buffer = ByteArray(4096)
                var bytesRead: Int
                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                }
                inputStream.close()
                
                outputStream.writeBytes(lineEnd)
                outputStream.writeBytes(twoHyphens + boundary + twoHyphens + lineEnd)
                outputStream.flush()
                outputStream.close()
                
                connection.responseCode == 200
            }
            if (result) onSuccess() else onError("Failed to upload photo")
        } catch (e: Exception) {
            e.printStackTrace()
            onError(e.message ?: "Unknown Error")
        }
    }
}

// --- Native Admin Panel Screen ---
@Composable
fun AdminScreen(
    apiBaseUrl: String,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableStateOf("orders") }
    // Tab data: (key, display label)
    val tabs = listOf(
        "orders" to "Orders",
        "products" to "Products",
        "other" to "Other"
    )
    
    var ordersList by remember { mutableStateOf<JSONArray?>(null) }
    var productsList by remember { mutableStateOf<JSONArray?>(null) }
    var subscriptionsList by remember { mutableStateOf<JSONArray?>(null) }
    var passportsList by remember { mutableStateOf<JSONArray?>(null) }
    var jarReturnsList by remember { mutableStateOf<JSONArray?>(null) }
    var referralsList by remember { mutableStateOf<JSONArray?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Dialog state for product add/edit
    var showProductDialog by remember { mutableStateOf(false) }
    var editingProductJson by remember { mutableStateOf<JSONObject?>(null) } // null for add new

    // Callback function to reload dashboard
    val reload = {
        isLoading = true
        errorMessage = null
        loadDashboardData(apiBaseUrl, onSuccess = { data ->
            ordersList = data.optJSONArray("orders")
            productsList = data.optJSONArray("products")
            subscriptionsList = data.optJSONArray("subscriptions")
            passportsList = data.optJSONArray("passports")
            jarReturnsList = data.optJSONArray("jarReturns")
            referralsList = data.optJSONArray("referrals")
            isLoading = false
        }, onError = { err ->
            errorMessage = err
            isLoading = false
        })
    }

    LaunchedEffect(Unit) {
        reload()
    }

    // Photo selector launcher for order dispatch photo uploads
    var targetPhotoOrderId by remember { mutableStateOf<String?>(null) }
    val photoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        val orderId = targetPhotoOrderId
        if (uri != null && orderId != null) {
            isLoading = true
            uploadDispatchPhoto(context, apiBaseUrl, orderId, uri, onSuccess = {
                Toast.makeText(context, "Dispatch photo uploaded successfully!", Toast.LENGTH_SHORT).show()
                reload()
            }, onError = { err ->
                Toast.makeText(context, "Upload failed: $err", Toast.LENGTH_SHORT).show()
                reload()
            })
        }
        targetPhotoOrderId = null
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFFFFFF))
    ) {
        // Top app bar style header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFFFFFFF))
                .border(BorderStroke(1.dp, Color(0xFFEAEAEA)))
                .padding(vertical = 12.dp, horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Text("⬅️", fontSize = 18.sp)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Admin Panel",
                fontFamily = FontFamily.Serif,
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF9A2C2C)
            )
            Spacer(modifier = Modifier.weight(1f))
            IconButton(onClick = { reload() }) {
                Text("🔄", fontSize = 18.sp)
            }
        }

        // Scrollable tab row
        ScrollableTabRow(
            selectedTabIndex = tabs.indexOfFirst { it.first == selectedTab }.coerceAtLeast(0),
            containerColor = Color.White,
            contentColor = Color(0xFF9A2C2C),
            edgePadding = 16.dp,
            indicator = { tabPositions ->
                val idx = tabs.indexOfFirst { it.first == selectedTab }.coerceAtLeast(0)
                if (idx < tabPositions.size) {
                    TabRowDefaults.SecondaryIndicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[idx]),
                        color = Color(0xFF9A2C2C)
                    )
                }
            },
            divider = { HorizontalDivider(color = Color(0x14000000)) }
        ) {
            tabs.forEach { (key, label) ->
                val isSelected = selectedTab == key
                Tab(
                    selected = isSelected,
                    onClick = { selectedTab = key },
                    text = {
                        Text(
                            text = label,
                            fontFamily = FontFamily.Serif,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 14.sp,
                            color = if (isSelected) Color(0xFF9A2C2C) else Color(0xFF666666),
                            maxLines = 1
                        )
                    }
                )
            }
        }

        // Main content
        if (isLoading) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFF9A2C2C))
            }
        } else if (errorMessage != null) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("⚠️ Sync Error", color = Color(0xFF9A2C2C), fontSize = 18.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Serif)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(errorMessage!!, color = Color(0xFF666666), textAlign = TextAlign.Center)
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { reload() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C)),
                        shape = RoundedCornerShape(0.dp)
                    ) {
                        Text("Retry", color = Color.White)
                    }
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp)
            ) {
                when (selectedTab) {
                    "orders" -> {
                        val count = ordersList?.length() ?: 0
                        Text("Total Orders: $count", fontWeight = FontWeight.Bold, color = Color(0xFF1A1A1A), fontFamily = FontFamily.Serif, fontSize = 15.sp, modifier = Modifier.padding(bottom = 8.dp))
                        
                        if (count == 0) {
                            Text("No orders placed yet.", color = Color(0xFF666666), modifier = Modifier.padding(vertical = 16.dp))
                        } else {
                            for (i in 0 until count) {
                                val orderObj = ordersList!!.getJSONObject(i)
                                val orderId = orderObj.getString("id")
                                val status = orderObj.optString("status", "NEW")
                                val itemsArr = orderObj.optJSONArray("items")
                                
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFAFAFA)),
                                    border = BorderStroke(1.dp, Color(0xFFEAEAEA)),
                                    shape = RoundedCornerShape(0.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 8.dp)
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                text = "ID: #${orderId.substring(0, 8).uppercase()}",
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFF9A2C2C),
                                                fontFamily = FontFamily.Serif
                                            )
                                            Text(
                                                text = status,
                                                fontWeight = FontWeight.Bold,
                                                color = when (status) {
                                                    "NEW" -> Color(0xFF0D47A1)
                                                    "DELIVERED" -> Color(0xFF1B5E20)
                                                    else -> Color(0xFFE65100)
                                                },
                                                fontSize = 12.sp,
                                                fontFamily = FontFamily.Serif
                                            )
                                        }

                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text("Customer: ${orderObj.getString("customerName")}", color = Color(0xFF1A1A1A))
                                        Text("Phone: ${orderObj.getString("phone")}", color = Color(0xFF666666))
                                        Text("Address: ${orderObj.getString("address")}, ${orderObj.getString("city")}, ${orderObj.getString("pincode")}", color = Color(0xFF666666))
                                        
                                        if (orderObj.optBoolean("isGiftOrder")) {
                                            Text("🎁 Gift Wrap: ${orderObj.optString("giftPackaging")}", color = Color(0xFF9A2C2C), fontWeight = FontWeight.SemiBold)
                                            orderObj.optString("giftMessage")?.let {
                                                if (it.isNotBlank() && it != "null") {
                                                    Text("✉️ Msg: \"$it\"", color = Color(0xFF9A2C2C), fontSize = 12.sp)
                                                }
                                            }
                                        }
                                        
                                        orderObj.optString("notes")?.let {
                                            if (it.isNotBlank() && it != "null") {
                                                Text("📝 Notes: $it", color = Color(0xFF333333), fontSize = 13.sp)
                                            }
                                        }

                                        Spacer(modifier = Modifier.height(10.dp))
                                        Text("Items:", fontWeight = FontWeight.Bold, color = Color(0xFF1A1A1A), fontSize = 13.sp)
                                        
                                        if (itemsArr != null) {
                                            for (k in 0 until itemsArr.length()) {
                                                val item = itemsArr.getJSONObject(k)
                                                val prod = item.optJSONObject("product")
                                                val name = prod?.optString("name") ?: "Product"
                                                Text("• $name × ${item.getInt("quantity")} (₹${item.getDouble("price")})", color = Color(0xFF666666), fontSize = 13.sp)
                                            }
                                        }
                                        
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text("Grand Total: ₹${orderObj.getDouble("totalAmount")}", fontWeight = FontWeight.Bold, color = Color(0xFF9A2C2C))

                                        orderObj.optString("dispatchPhotoUrl")?.let { url ->
                                            if (url.isNotBlank() && url != "null") {
                                                Spacer(modifier = Modifier.height(8.dp))
                                                Text("📸 Dispatch Photo Attached", color = Color(0xFF1B5E20), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                                AsyncImage(
                                                    model = url,
                                                    contentDescription = "Dispatch Photo",
                                                    contentScale = ContentScale.Crop,
                                                    modifier = Modifier
                                                        .fillMaxWidth()
                                                        .height(120.dp)
                                                        .padding(top = 4.dp)
                                                        .border(1.dp, Color(0xFFEAEAEA))
                                                )
                                            }
                                        }

                                        Divider(color = Color(0xFFEAEAEA), modifier = Modifier.padding(vertical = 12.dp))

                                        Text("Update Status:", color = Color(0xFF666666), fontSize = 12.sp, modifier = Modifier.padding(bottom = 6.dp))
                                        Row(
                                            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            val nextStatusOptions = listOf("NEW", "CONFIRMED", "PACKED", "DISPATCHED", "DELIVERED")
                                            nextStatusOptions.forEach { opt ->
                                                val isCurrent = status == opt
                                                Button(
                                                    onClick = {
                                                        isLoading = true
                                                        updateOrderStatus(apiBaseUrl, orderId, opt, onSuccess = {
                                                            Toast.makeText(context, "Status updated to $opt", Toast.LENGTH_SHORT).show()
                                                            reload()
                                                        }, onError = { err ->
                                                            Toast.makeText(context, "Error: $err", Toast.LENGTH_SHORT).show()
                                                            reload()
                                                        })
                                                    },
                                                    colors = ButtonDefaults.buttonColors(
                                                        containerColor = if (isCurrent) Color(0xFF9A2C2C) else Color(0xFFEEEEEE),
                                                        contentColor = if (isCurrent) Color.White else Color(0xFF1A1A1A)
                                                    ),
                                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                                    shape = RoundedCornerShape(0.dp)
                                                ) {
                                                    Text(opt, fontSize = 10.sp)
                                                }
                                            }
                                        }

                                        if (status == "DISPATCHED" || status == "DELIVERED") {
                                            Spacer(modifier = Modifier.height(10.dp))
                                            Button(
                                                onClick = {
                                                    targetPhotoOrderId = orderId
                                                    photoLauncher.launch("image/*")
                                                },
                                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF333333), contentColor = Color.White),
                                                modifier = Modifier.fillMaxWidth(),
                                                shape = RoundedCornerShape(0.dp)
                                            ) {
                                                Text("📸 Upload Dispatch Photo", color = Color.White, fontSize = 12.sp, fontFamily = FontFamily.Serif)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    "products" -> {
                        Button(
                            onClick = {
                                editingProductJson = null
                                showProductDialog = true
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B5E20), contentColor = Color.White),
                            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                            shape = RoundedCornerShape(0.dp)
                        ) {
                            Text("➕ Add New Product", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                        }

                        val count = productsList?.length() ?: 0
                        if (count == 0) {
                            Text("No products in menu.", color = Color(0xFF666666))
                        } else {
                            for (i in 0 until count) {
                                val productObj = productsList!!.getJSONObject(i)
                                val id = productObj.getString("id")
                                val name = productObj.getString("name")
                                val price = productObj.getDouble("price")
                                val stock = productObj.optInt("stockCount", 0)
                                val stockStatus = productObj.optString("stockStatus", "IN_STOCK")
                                
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFAFAFA)),
                                    border = BorderStroke(1.dp, Color(0xFFEAEAEA)),
                                    shape = RoundedCornerShape(0.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 8.dp)
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Text(name, fontWeight = FontWeight.Bold, color = Color(0xFF1A1A1A), fontFamily = FontFamily.Serif, fontSize = 16.sp)
                                        Text("Price: ₹$price | Stock: $stock ($stockStatus)", color = Color(0xFF666666), fontSize = 13.sp)
                                        Spacer(modifier = Modifier.height(12.dp))
                                        
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                                        ) {
                                            Button(
                                                onClick = {
                                                    editingProductJson = productObj
                                                    showProductDialog = true
                                                },
                                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF333333), contentColor = Color.White),
                                                modifier = Modifier.weight(1f),
                                                shape = RoundedCornerShape(0.dp)
                                            ) {
                                                Text("Edit", color = Color.White, fontSize = 12.sp)
                                            }
                                            Button(
                                                onClick = {
                                                    isLoading = true
                                                    deleteProduct(apiBaseUrl, id, onSuccess = {
                                                        Toast.makeText(context, "$name deleted successfully!", Toast.LENGTH_SHORT).show()
                                                        reload()
                                                    }, onError = { err ->
                                                        Toast.makeText(context, "Error: $err", Toast.LENGTH_SHORT).show()
                                                        reload()
                                                    })
                                                },
                                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF9A2C2C), contentColor = Color.White),
                                                modifier = Modifier.weight(1f),
                                                shape = RoundedCornerShape(0.dp)
                                            ) {
                                                Text("Delete", color = Color.White, fontSize = 12.sp)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    "other" -> {
                        Text("Subscriptions (Achar Club):", fontWeight = FontWeight.Bold, color = Color(0xFF9A2C2C), fontFamily = FontFamily.Serif, fontSize = 15.sp, modifier = Modifier.padding(top = 8.dp))
                        val subCount = subscriptionsList?.length() ?: 0
                        if (subCount == 0) {
                            Text("No subscriptions yet.", color = Color(0xFF666666), fontSize = 13.sp)
                        } else {
                            for (i in 0 until subCount) {
                                val item = subscriptionsList!!.getJSONObject(i)
                                Text("• ${item.getString("email")}", color = Color(0xFF1A1A1A), fontSize = 13.sp)
                            }
                        }

                        Divider(color = Color(0xFFEAEAEA), modifier = Modifier.padding(vertical = 12.dp))
                        Text("Pickle Passports (Completed):", fontWeight = FontWeight.Bold, color = Color(0xFF9A2C2C), fontFamily = FontFamily.Serif, fontSize = 15.sp)
                        val passCount = passportsList?.length() ?: 0
                        if (passCount == 0) {
                            Text("No passports created.", color = Color(0xFF666666), fontSize = 13.sp)
                        } else {
                            for (i in 0 until passCount) {
                                val item = passportsList!!.getJSONObject(i)
                                val name = item.optString("customerName", "Guest")
                                val phone = item.getString("phone")
                                val complete = item.optBoolean("isComplete", false)
                                val claimed = item.optBoolean("freeJarUnclaimedClaimed", false) || item.optBoolean("freeJarClaimed", false)
                                
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFAFAFA)),
                                    border = BorderStroke(1.dp, Color(0xFFEAEAEA)),
                                    shape = RoundedCornerShape(0.dp),
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text(name, fontWeight = FontWeight.Bold, color = Color(0xFF1A1A1A))
                                            Text("Phone: $phone", color = Color(0xFF666666), fontSize = 12.sp)
                                            Text("Status: " + if (complete) "Complete ✅" else "In Progress", color = Color(0xFF666666), fontSize = 12.sp)
                                            Text("Claimed: " + if (claimed) "Yes 🎁" else "No", color = Color(0xFF666666), fontSize = 12.sp)
                                        }
                                        if (complete && !claimed) {
                                            Button(
                                                onClick = {
                                                    isLoading = true
                                                    claimPassport(apiBaseUrl, phone, onSuccess = {
                                                        Toast.makeText(context, "Free jar claimed!", Toast.LENGTH_SHORT).show()
                                                        reload()
                                                    }, onError = { err ->
                                                        Toast.makeText(context, "Error: $err", Toast.LENGTH_SHORT).show()
                                                        reload()
                                                    })
                                                },
                                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B5E20)),
                                                shape = RoundedCornerShape(0.dp)
                                            ) {
                                                Text("Claim Jar", color = Color.White, fontSize = 11.sp)
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        Divider(color = Color(0xFFEAEAEA), modifier = Modifier.padding(vertical = 12.dp))
                        Text("Jar Returns Pickup:", fontWeight = FontWeight.Bold, color = Color(0xFF9A2C2C), fontFamily = FontFamily.Serif, fontSize = 15.sp)
                        val returnCount = jarReturnsList?.length() ?: 0
                        if (returnCount == 0) {
                            Text("No jar return logs.", color = Color(0xFF666666), fontSize = 13.sp)
                        } else {
                            for (i in 0 until returnCount) {
                                val item = jarReturnsList!!.getJSONObject(i)
                                Text("• ${item.optString("customerName")} (Jars: ${item.getInt("jarsCount")})", color = Color(0xFF1A1A1A), fontSize = 13.sp)
                            }
                        }

                        Divider(color = Color(0xFFEAEAEA), modifier = Modifier.padding(vertical = 12.dp))
                        Text("Referral Codes Usage:", fontWeight = FontWeight.Bold, color = Color(0xFF9A2C2C), fontFamily = FontFamily.Serif, fontSize = 15.sp)
                        val refCount = referralsList?.length() ?: 0
                        if (refCount == 0) {
                            Text("No referrals created.", color = Color(0xFF666666), fontSize = 13.sp)
                        } else {
                            for (i in 0 until refCount) {
                                val item = referralsList!!.getJSONObject(i)
                                val used = item.optBoolean("isUsed", false)
                                Text("• Code: ${item.getString("referralCode")} | Referrer: ${item.getString("referrerName")} | Used: " + (if (used) "Yes" else "No"), color = Color(0xFF1A1A1A), fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }
    }

    if (showProductDialog) {
        val isEdit = editingProductJson != null
        var name by remember { mutableStateOf(editingProductJson?.optString("name") ?: "") }
        var description by remember { mutableStateOf(editingProductJson?.optString("description") ?: "") }
        var price by remember { mutableStateOf(editingProductJson?.optDouble("price")?.toString() ?: "") }
        var imageUrl by remember { mutableStateOf(editingProductJson?.optString("imageUrl") ?: "") }
        var category by remember { mutableStateOf(editingProductJson?.optString("category") ?: "Pickle") }
        var stockStatus by remember { mutableStateOf(editingProductJson?.optString("stockStatus") ?: "IN_STOCK") }
        var stockCount by remember { mutableStateOf(editingProductJson?.optInt("stockCount")?.toString() ?: "10") }

        AlertDialog(
            onDismissRequest = { showProductDialog = false },
            title = { Text(if (isEdit) "Edit Product" else "Add New Product", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold) },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                    OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Product Name") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp))
                    OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp))
                    OutlinedTextField(value = price, onValueChange = { price = it }, label = { Text("Price (₹)") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp))
                    OutlinedTextField(value = imageUrl, onValueChange = { imageUrl = it }, label = { Text("Image Path/URL") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp))
                    OutlinedTextField(value = category, onValueChange = { category = it }, label = { Text("Category") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp))
                    OutlinedTextField(value = stockStatus, onValueChange = { stockStatus = it }, label = { Text("Stock Status (IN_STOCK / OUT_OF_STOCK)") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp))
                    OutlinedTextField(value = stockCount, onValueChange = { stockCount = it }, label = { Text("Stock Count") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp))
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (name.isBlank() || description.isBlank() || price.isBlank()) {
                            Toast.makeText(context, "Please fill in Name, Desc, and Price", Toast.LENGTH_SHORT).show()
                            return@TextButton
                        }
                        showProductDialog = false
                        isLoading = true
                        val prodData = JSONObject().apply {
                            put("name", name)
                            put("description", description)
                            put("price", price.toDoubleOrNull() ?: 0.0)
                            put("imageUrl", imageUrl)
                            put("category", category)
                            put("stockStatus", stockStatus)
                            put("stockCount", stockCount.toIntOrNull() ?: 0)
                        }
                        upsertProduct(apiBaseUrl, editingProductJson?.optString("id"), prodData, onSuccess = {
                            Toast.makeText(context, "Product saved successfully!", Toast.LENGTH_SHORT).show()
                            reload()
                        }, onError = { err ->
                            Toast.makeText(context, "Error: $err", Toast.LENGTH_SHORT).show()
                            reload()
                        })
                    }
                ) {
                    Text("Save", color = Color(0xFF9A2C2C), fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showProductDialog = false }) {
                    Text("Cancel", color = Color(0xFF666666), fontFamily = FontFamily.Serif)
                }
            },
            containerColor = Color(0xFFFFFFFF)
        )
    }
}
