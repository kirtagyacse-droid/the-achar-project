import Foundation
import Combine

class NetworkManager: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var isOffline = false
    
    // Store API URL in UserDefaults for easy runtime changes (like developer mode in Android)
    var apiBaseUrl: String {
        get {
            UserDefaults.standard.string(forKey: "target_url") ?? "https://the-achar-project.vercel.app"
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
}
