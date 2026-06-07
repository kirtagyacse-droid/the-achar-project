import Foundation
import Combine

// --- Admin Codable Models ---
struct AdminDashboardData: Codable {
    let orders: [AdminOrder]
    let products: [Product]
    let subscriptions: [AdminSubscription]
    let passports: [AdminPassport]
    let jarReturns: [AdminJarReturn]
    let referrals: [AdminReferral]
}

struct AdminOrder: Identifiable, Codable {
    let id: String
    let customerName: String
    let phone: String
    let altPhone: String?
    let address: String
    let landmark: String?
    let city: String
    let state: String
    let pincode: String
    let notes: String?
    let totalAmount: Double
    let status: String
    let paymentMethod: String
    let isGiftOrder: Bool
    let giftMessage: String?
    let giftPackaging: String?
    let dispatchPhotoUrl: String?
    let items: [AdminOrderItem]
}

struct AdminOrderItem: Identifiable, Codable {
    let id: String
    let productId: String
    let quantity: Int
    let price: Double
    let product: Product
}

struct AdminSubscription: Identifiable, Codable {
    let id: String
    let customerName: String
    let phone: String
    let email: String?
    let address: String
    let planJars: Int
    let isActive: Bool
    let notes: String?
}

struct AdminPassport: Identifiable, Codable {
    let id: String
    let phone: String
    let customerName: String
    let stamps: [String]
    let isComplete: Bool
    let freeJarClaimed: Bool
}

struct AdminJarReturn: Identifiable, Codable {
    let id: String
    let phone: String
    let customerName: String
    let jarCount: Int
    let discountApplied: Bool
}

struct AdminReferral: Identifiable, Codable {
    let id: String
    let referrerPhone: String
    let referrerName: String
    let referralCode: String
    let usedByPhone: String?
    let usedByName: String?
    let isUsed: Bool
}
// --- End Admin Models ---

class NetworkManager: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var isOffline = false
    
    // Store API URL in UserDefaults for easy runtime changes (like developer mode in Android)
    var apiBaseUrl: String {
        get {
            UserDefaults.standard.string(forKey: "target_url") ?? "https://rssavoury.com"
        }
        set {
            UserDefaults.standard.set(newValue, forKey: "target_url")
            objectWillChange.send()
            fetchProducts()
        }
    }
    
    init() {
        loadCachedProducts()
        fetchProducts()
    }
    
    func loadCachedProducts() {
        if let data = UserDefaults.standard.data(forKey: "products_cache"),
           let cached = try? JSONDecoder().decode([Product].self, from: data) {
            self.products = cached
        }
    }
    
    func cacheProducts(_ products: [Product]) {
        if let data = try? JSONEncoder().encode(products) {
            UserDefaults.standard.set(data, forKey: "products_cache")
        }
    }
    
    func fetchProducts() {
        guard let url = URL(string: "\(apiBaseUrl)/api/products") else { return }
        
        isLoading = true
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let error = error {
                    print("Network error: \(error.localizedDescription)")
                    self?.isOffline = true
                    if self?.products.isEmpty ?? true {
                        self?.products = self?.getDummyOfflineProducts() ?? []
                    }
                    return
                }
                
                guard let data = data else {
                    self?.isOffline = true
                    return
                }
                
                do {
                    let decoder = JSONDecoder()
                    // Handle dates or formats if needed
                    let decodedProducts = try decoder.decode([Product].self, from: data)
                    self?.products = decodedProducts
                    self?.cacheProducts(decodedProducts)
                    self?.isOffline = false
                } catch {
                    print("Decoding error: \(error)")
                    self?.isOffline = true
                }
            }
        }.resume()
    }
    
    func getDummyOfflineProducts() -> [Product] {
        return [
            Product(
                id: "offline-1",
                name: "Offline Mango Pickle",
                description: "Sun-dried mangoes marinated in cold-pressed mustard oil and aromatic spices.",
                price: 299.0,
                imageUrl: nil,
                category: "Pickle",
                stockStatus: "IN_STOCK",
                stockCount: 15,
                spiciness: 3,
                flavorProfile: FlavorProfile(tangy: 4, spicy: 4, sweet: 1, savory: 4, salty: 3),
                season: nil
            )
        ]
    }
    
    // --- Admin Authentication ---
    func adminLogin(password: String, completion: @escaping (Bool) -> Void) {
        guard let url = URL(string: "\(apiBaseUrl)/api/admin/login") else {
            completion(false)
            return
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let bodyJson = ["password": password]
        request.httpBody = try? JSONSerialization.data(withJSONObject: bodyJson, options: [])
        
        URLSession.shared.dataTask(with: request) { data, response, _ in
            DispatchQueue.main.async {
                if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                    completion(true)
                } else {
                    completion(false)
                }
            }
        }.resume()
    }
    
    // --- Admin Dashboard Data ---
    func fetchDashboardData(completion: @escaping (Result<AdminDashboardData, Error>) -> Void) {
        guard let url = URL(string: "\(apiBaseUrl)/api/admin/dashboard") else {
            completion(.failure(NetworkError.invalidUrl))
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, _, error in
            DispatchQueue.main.async {
                if let error = error {
                    completion(.failure(error))
                    return
                }
                guard let data = data else {
                    completion(.failure(NetworkError.noData))
                    return
                }
                do {
                    let decoded = try JSONDecoder().decode(AdminDashboardData.self, from: data)
                    completion(.success(decoded))
                } catch {
                    completion(.failure(error))
                }
            }
        }.resume()
    }
    
    // --- Admin Order Status Update ---
    func updateOrderStatus(orderId: String, status: String, completion: @escaping () -> Void) {
        guard let url = URL(string: "\(apiBaseUrl)/api/admin/orders/\(orderId)") else {
            completion()
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["status": status]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])
        
        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                completion()
            }
        }.resume()
    }
    
    // --- Admin Photo Upload ---
    func uploadDispatchPhoto(orderId: String, data: Data, completion: @escaping () -> Void) {
        guard let url = URL(string: "\(apiBaseUrl)/api/admin/orders/\(orderId)/dispatch-photo") else {
            completion()
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        let lineEnd = "\r\n"
        let twoHyphens = "--"
        
        body.append(Data("\(twoHyphens)\(boundary)\(lineEnd)".utf8))
        body.append(Data("Content-Disposition: form-data; name=\"file\"; filename=\"photo.jpg\"\(lineEnd)".utf8))
        body.append(Data("Content-Type: image/jpeg\(lineEnd)\(lineEnd)".utf8))
        body.append(data)
        body.append(Data("\(lineEnd)".utf8))
        body.append(Data("\(twoHyphens)\(boundary)\(twoHyphens)\(lineEnd)".utf8))
        
        request.httpBody = body
        
        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                completion()
            }
        }.resume()
    }
    
    // --- Admin Product CRUD ---
    func saveProduct(id: String?, name: String, description: String, price: Double,
                    imageUrl: String, category: String, stockStatus: String,
                    stockCount: Int, spiciness: Int, completion: @escaping () -> Void) {
        let prodId = id
        let endpoint = prodId == nil ? "/api/admin/products" : "/api/admin/products/\(prodId!)"
        guard let url = URL(string: "\(apiBaseUrl)\(endpoint)") else {
            completion()
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = prodId == nil ? "POST" : "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        var bodyJson: [String: Any] = [
            "name": name,
            "description": description,
            "price": price,
            "imageUrl": imageUrl,
            "category": category,
            "stockStatus": stockStatus,
            "stockCount": stockCount,
            "spiciness": spiciness
        ]
        
        if let prodId = prodId {
            bodyJson["id"] = prodId
        }
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: bodyJson, options: [])
        
        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                completion()
            }
        }.resume()
    }
    
    func deleteProduct(productId: String, completion: @escaping () -> Void) {
        guard let url = URL(string: "\(apiBaseUrl)/api/admin/products/\(productId)") else {
            completion()
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                completion()
            }
        }.resume()
    }
    
    // --- Admin Passport Claim ---
    func claimPassportGift(phone: String, completion: @escaping () -> Void) {
        guard let url = URL(string: "\(apiBaseUrl)/api/admin/claim-passport") else {
            completion()
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["phone": phone]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])
        
        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                completion()
            }
        }.resume()
    }
    
    // --- Order Submission ---
    func submitOrder(name: String, phone: String, altPhone: String?, address: String,
                    landmark: String?, city: String, state: String, pincode: String,
                    notes: String?, totalAmount: Double, isGiftOrder: Bool,
                    giftPackaging: String?, giftMessage: String?,
                    items: [[String: Any]], completion: @escaping (Result<Int, Error>) -> Void) {
        guard let url = URL(string: "\(apiBaseUrl)/api/orders") else {
            completion(.failure(NetworkError.invalidUrl))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        var bodyJson: [String: Any] = [
            "customerName": name,
            "phone": phone,
            "address": address,
            "city": city,
            "state": state,
            "pincode": pincode,
            "totalAmount": totalAmount,
            "isGiftOrder": isGiftOrder,
            "items": items
        ]
        
        if let altPhone = altPhone, !altPhone.isEmpty { bodyJson["altPhone"] = altPhone }
        if let landmark = landmark, !landmark.isEmpty { bodyJson["landmark"] = landmark }
        if let notes = notes, !notes.isEmpty { bodyJson["notes"] = notes }
        if isGiftOrder {
            bodyJson["giftPackaging"] = giftPackaging ?? "cloth"
            if let giftMessage = giftMessage, !giftMessage.isEmpty { bodyJson["giftMessage"] = giftMessage }
        }
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: bodyJson, options: [])
        
        URLSession.shared.dataTask(with: request) { _, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    completion(.failure(error))
                    return
                }
                let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 500
                completion(.success(statusCode))
            }
        }.resume()
    }
}

enum NetworkError: Error {
    case invalidUrl
    case noData
}
