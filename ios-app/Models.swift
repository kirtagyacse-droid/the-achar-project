import Foundation

struct FlavorProfile: Codable, Hashable {
    var tangy: Int = 3
    var spicy: Int = 3
    var sweet: Int = 1
    var savory: Int = 3
    var salty: Int = 3
}

struct Product: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let description: String
    let price: Double
    let imageUrl: String?
    let category: String
    let stockStatus: String
    let stockCount: Int
    let spiciness: Int
    var flavorProfile: FlavorProfile
    var batchNumber: String
    let season: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, price, imageUrl, category, stockStatus, stockCount, spiciness, flavorProfile, batchNumber, season
    }
    
    init(id: String, name: String, description: String, price: Double, imageUrl: String?, category: String, stockStatus: String, stockCount: Int, spiciness: Int, flavorProfile: FlavorProfile, batchNumber: String = "Batch #012", season: String?) {
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.imageUrl = imageUrl
        self.category = category
        self.stockStatus = stockStatus
        self.stockCount = stockCount
        self.spiciness = spiciness
        self.flavorProfile = flavorProfile
        self.batchNumber = batchNumber
        self.season = season
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        description = try container.decode(String.self, forKey: .description)
        price = try container.decode(Double.self, forKey: .price)
        imageUrl = try container.decodeIfPresent(String.self, forKey: .imageUrl)
        category = try container.decodeIfPresent(String.self, forKey: .category) ?? "Pickle"
        stockStatus = try container.decodeIfPresent(String.self, forKey: .stockStatus) ?? "IN_STOCK"
        stockCount = try container.decodeIfPresent(Int.self, forKey: .stockCount) ?? 10
        spiciness = try container.decodeIfPresent(Int.self, forKey: .spiciness) ?? 2
        flavorProfile = try container.decodeIfPresent(FlavorProfile.self, forKey: .flavorProfile) ?? FlavorProfile()
        batchNumber = try container.decodeIfPresent(String.self, forKey: .batchNumber) ?? "Batch #012"
        season = try container.decodeIfPresent(String.self, forKey: .season)
    }
    
    func getFullImageUrl(apiBaseUrl: String) -> URL? {
        guard let imageUrl = imageUrl, !imageUrl.isEmpty else { return nil }
        if imageUrl.hasPrefix("/") {
            return URL(string: "\(apiBaseUrl)\(imageUrl)")
        } else {
            return URL(string: imageUrl)
        }
    }
}

struct CartItem: Identifiable, Hashable {
    var id: String { product.id }
    let product: Product
    var quantity: Int
}

enum Screen: String, CaseIterable {
    case catalog = "Catalog"
    case quiz = "Flavor Quiz"
    case passport = "Passport"
    case returns = "Returns"
    case diary = "Achar Diary"
    case admin = "Admin"
    
    var iconName: String {
        switch self {
        case .catalog: return "square.grid.2x2.fill"
        case .quiz: return "sparkles"
        case .passport: return "checkmark.seal.fill"
        case .returns: return "arrow.counterclockwise.circle.fill"
        case .diary: return "book.closed.fill"
        case .admin: return "person.badge.key.fill"
        }
    }
}
