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
    var batchNumber: String = "Batch #012"
    let season: String?
}

struct CartItem: Identifiable, Codable, Hashable {
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
