import SwiftUI

struct CatalogView: View {
    @EnvironmentObject var networkManager: NetworkManager
    @Binding var cartItems: [CartItem]
    @Binding var showCartSheet: Bool
    
    @State private var selectedCategory: String = "All"
    @State private var selectedProduct: Product? = nil
    
    let categories = ["All", "Pickle", "Pantry", "Seasonal"]
    
    var filteredProducts: [Product] {
        if selectedCategory == "All" {
            // Exclude explicit seasonal / pantry sections so they render in custom blocks
            return networkManager.products.filter { $0.season == nil && $0.category != "Pantry" }
        } else if selectedCategory == "Seasonal" {
            return networkManager.products.filter { $0.season != nil }
        } else {
            return networkManager.products.filter { $0.category == selectedCategory }
        }
    }
    
    var seasonalProducts: [Product] {
        let currentSeason = getCurrentAppSeason()
        return networkManager.products.filter { $0.season == currentSeason }
    }
    
    var pantryProducts: [Product] {
        return networkManager.products.filter { $0.category == "Pantry" }
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Secondary horizontal category strip
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(categories, id: \.self) { category in
                            Button(action: {
                                selectedCategory = category
                            }) {
                                Text(category)
                                    .font(.system(size: 14, weight: selectedCategory == category ? .bold : .medium))
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .foregroundColor(selectedCategory == category ? .white : .gray)
                                    .background(selectedCategory == category ? Color(red: 154/255, green: 44/255, blue: 44/255) : Color(white: 0.95))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                }
                
                // Show custom seasonal sections in the "All" tab
                if selectedCategory == "All" {
                    let currentSeason = getCurrentAppSeason()
                    if !seasonalProducts.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: currentSeason == "summer" ? "sun.max.fill" : "snowflake")
                                    .foregroundColor(currentSeason == "summer" ? .orange : .blue)
                                Text(currentSeason == "summer" ? "Summer Specials" : "Winter Specials")
                                    .font(.headline)
                                    .fontWeight(.bold)
                            }
                            .padding(.horizontal, 16)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(seasonalProducts) { product in
                                        ProductCard(product: product)
                                            .onTapGesture { selectedProduct = product }
                                    }
                                }
                                .padding(.horizontal, 16)
                            }
                        }
                        .padding(.vertical, 8)
                        .background(currentSeason == "summer" ? Color.yellow.opacity(0.08) : Color.blue.opacity(0.08))
                    }
                    
                    if !pantryProducts.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "archivebox.fill")
                                    .foregroundColor(.green)
                                Text("From Our Pantry")
                                    .font(.headline)
                                    .fontWeight(.bold)
                            }
                            .padding(.horizontal, 16)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(pantryProducts) { product in
                                        ProductCard(product: product)
                                            .onTapGesture { selectedProduct = product }
                                    }
                                }
                                .padding(.horizontal, 16)
                            }
                        }
                        .padding(.vertical, 8)
                        .background(Color.green.opacity(0.08))
                    }
                }
                
                // Main Product Grid
                Text(selectedCategory == "All" ? "Our Pickles Menu" : "\(selectedCategory) Collection")
                    .font(.title3)
                    .fontWeight(.bold)
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                    ForEach(filteredProducts) { product in
                        ProductCard(product: product)
                            .onTapGesture { selectedProduct = product }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 80) // bottom bar padding buffer
            }
        }
        .sheet(item: $selectedProduct) { product in
            ProductDetailView(product: product, cartItems: $cartItems)
        }
    }
    
    func getCurrentAppSeason() -> String? {
        let month = Calendar.current.component(.month, from: Date())
        if (3...6).contains(month) {
            return "summer"
        } else if month >= 10 || month <= 2 {
            return "winter"
        }
        return nil
    }
}

struct ProductCard: View {
    let product: Product
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topTrailing) {
                if let imgUrlStr = product.imageUrl, let url = URL(string: imgUrlStr) {
                    AsyncImage(url: url) { phase in
                        if let image = phase.image {
                            image.resizable().aspectRatio(contentMode: .fill)
                        } else {
                            Color(white: 0.9).overlay(ProgressView())
                        }
                    }
                    .frame(height: 140)
                    .clipped()
                } else {
                    Color(white: 0.9)
                        .frame(height: 140)
                        .overlay(Image(systemName: "leaf.fill").foregroundColor(.gray))
                }
                
                if product.season != nil {
                    Text(product.season?.capitalized ?? "")
                        .font(.system(size: 10, weight: .bold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.orange)
                        .foregroundColor(.white)
                        .clipShape(Capsule())
                        .padding(8)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.system(size: 14, weight: .semibold))
                    .lineLimit(1)
                
                Text("₹\(Int(product.price))")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
            }
            .padding(.horizontal, 8)
            .padding(.bottom, 8)
        }
        .frame(width: 160)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.06), radius: 6, x: 0, y: 3)
    }
}

struct ProductDetailView: View {
    let product: Product
    @Binding var cartItems: [CartItem]
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Image Header
                if let imgUrlStr = product.imageUrl, let url = URL(string: imgUrlStr) {
                    AsyncImage(url: url) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Color(white: 0.9)
                    }
                    .frame(height: 250)
                    .clipped()
                }
                
                VStack(alignment: .leading, spacing: 12) {
                    Text(product.name)
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("₹\(Int(product.price))")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    
                    Text(product.description)
                        .font(.body)
                        .foregroundColor(.secondary)
                    
                    Divider()
                    
                    // Spiciness Indicator
                    HStack {
                        Text("Spiciness Level:")
                            .fontWeight(.medium)
                        ForEach(0..<5) { index in
                            Image(systemName: index < product.spiciness ? "flame.fill" : "flame")
                                .foregroundColor(index < product.spiciness ? .red : .gray)
                        }
                    }
                    .padding(.vertical, 4)
                    
                    Divider()
                    
                    // Add to Cart Button
                    Button(action: {
                        if let index = cartItems.firstIndex(where: { $0.product.id == product.id }) {
                            cartItems[index].quantity += 1
                        } else {
                            cartItems.append(CartItem(product: product, quantity: 1))
                        }
                        presentationMode.wrappedValue.dismiss()
                    }) {
                        Text("Add to Cart")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                            .cornerRadius(12)
                    }
                    .padding(.top, 12)
                }
                .padding(16)
            }
        }
    }
}
