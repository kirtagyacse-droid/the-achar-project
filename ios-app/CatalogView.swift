import SwiftUI

struct CatalogView: View {
    @EnvironmentObject var networkManager: NetworkManager
    @Binding var cartItems: [CartItem]
    @Binding var activeSheet: MainLayoutView.ActiveSheet?
    
    @State private var selectedCategory: String = "All"
    
    let categories = ["All", "Pickle", "Pantry", "Seasonal"]
    
    var filteredProducts: [Product] {
        if selectedCategory == "All" {
            return networkManager.products.filter { $0.season == nil && $0.category != "Pantry" && $0.category != "From Our Pantry" && $0.category != "Summer Special" && $0.category != "Winter Special" }
        } else if selectedCategory == "Seasonal" {
            return networkManager.products.filter { $0.season != nil }
        } else {
            return networkManager.products.filter { $0.category.lowercased() == selectedCategory.lowercased() }
        }
    }
    
    var seasonalProducts: [Product] {
        networkManager.products.filter { $0.season == getCurrentAppSeason() }
    }
    
    var pantryProducts: [Product] {
        networkManager.products.filter { $0.category.lowercased() == "pantry" || $0.category.lowercased() == "from our pantry" }
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
                                    .font(.system(size: 14, weight: selectedCategory == category ? .bold : .medium, design: .serif))
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
                    if !seasonalProducts.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: getCurrentAppSeason() == "summer" ? "sun.max.fill" : "snowflake")
                                    .foregroundColor(getCurrentAppSeason() == "summer" ? .orange : .blue)
                                Text(getCurrentAppSeason() == "summer" ? "Summer Specials" : "Winter Specials")
                                    .font(.system(.headline, design: .serif))
                                    .fontWeight(.bold)
                                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                            }
                            .padding(.horizontal, 16)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(seasonalProducts) { product in
                                        ProductCard(product: product)
                                            .onTapGesture { activeSheet = .product(product) }
                                    }
                                }
                                .padding(.horizontal, 16)
                            }
                        }
                        .padding(.vertical, 12)
                        .background(getCurrentAppSeason() == "summer" ? Color.orange.opacity(0.05) : Color.blue.opacity(0.05))
                    }
                    
                    if !pantryProducts.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "archivebox.fill")
                                    .foregroundColor(.green)
                                Text("From Our Pantry")
                                    .font(.system(.headline, design: .serif))
                                    .fontWeight(.bold)
                                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                            }
                            .padding(.horizontal, 16)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(pantryProducts) { product in
                                        ProductCard(product: product)
                                            .onTapGesture { activeSheet = .product(product) }
                                    }
                                }
                                .padding(.horizontal, 16)
                            }
                        }
                        .padding(.vertical, 12)
                        .background(Color.green.opacity(0.05))
                    }
                }
                
                // Main Product Grid
                Text(selectedCategory == "All" ? "Our Pickles Menu" : "\(selectedCategory) Collection")
                    .font(.system(.title3, design: .serif))
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 26/255, green: 26/255, blue: 26/255))
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                
                if filteredProducts.isEmpty {
                    VStack {
                        Spacer()
                        Text("No products available.")
                            .font(.system(.body, design: .serif))
                            .foregroundColor(.gray)
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding(.vertical, 40)
                        Spacer()
                    }
                } else {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        ForEach(filteredProducts) { product in
                            ProductCard(product: product)
                                .onTapGesture { activeSheet = .product(product) }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 80) // bottom bar padding buffer
                }
            }
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
    @EnvironmentObject var networkManager: NetworkManager
    let product: Product
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topTrailing) {
                if let url = product.getFullImageUrl(apiBaseUrl: networkManager.apiBaseUrl) {
                    AsyncImage(url: url) { phase in
                        if let image = phase.image {
                            image.resizable().aspectRatio(contentMode: .fill)
                        } else {
                            Color(white: 0.98).overlay(ProgressView())
                        }
                    }
                    .frame(height: 140)
                    .clipped()
                } else {
                    CanvasJarPlaceholder()
                        .frame(height: 140)
                        .padding(12)
                        .background(Color(white: 0.98))
                }
                
                if let season = product.season {
                    Text(season.capitalized)
                        .font(.system(size: 9, weight: .bold, design: .sansSerif))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(season == "summer" ? Color.orange : Color.blue)
                        .foregroundColor(.white)
                        .clipShape(Capsule())
                        .padding(8)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.system(size: 14, weight: .bold, design: .serif))
                    .foregroundColor(Color(red: 26/255, green: 26/255, blue: 26/255))
                    .lineLimit(1)
                
                HStack {
                    Text("₹\(Int(product.price))")
                        .font(.system(size: 14, weight: .bold, design: .serif))
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    Spacer()
                    if product.spiciness > 0 {
                        HStack(spacing: 1) {
                            ForEach(0..<product.spiciness, id: \.self) { _ in
                                Text("🌶️").font(.system(size: 10))
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 10)
            .padding(.bottom, 10)
        }
        .frame(width: 160)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.06), radius: 6, x: 0, y: 3)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(white: 0.95), lineWidth: 1)
        )
    }
}

struct ProductDetailView: View {
    @EnvironmentObject var networkManager: NetworkManager
    let product: Product
    @Binding var cartItems: [CartItem]
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Image Header
                ZStack(alignment: .topTrailing) {
                    if let url = product.getFullImageUrl(apiBaseUrl: networkManager.apiBaseUrl) {
                        AsyncImage(url: url) { image in
                            image.resizable().aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Color(white: 0.98).overlay(ProgressView())
                        }
                        .frame(height: 250)
                        .clipped()
                    } else {
                        CanvasJarPlaceholder()
                            .frame(height: 220)
                            .padding(24)
                            .background(Color(white: 0.98))
                    }
                    
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title)
                            .foregroundColor(.white)
                            .shadow(radius: 3)
                            .padding()
                    }
                }
                
                VStack(alignment: .leading, spacing: 12) {
                    Text(product.name)
                        .font(.system(.title2, design: .serif))
                        .fontWeight(.black)
                        .foregroundColor(Color(red: 26/255, green: 26/255, blue: 26/255))
                    
                    Text("Category: \(product.category) | \(product.batchNumber)")
                        .font(.system(size: 12, design: .serif))
                        .foregroundColor(.secondary)
                    
                    Text("₹\(Int(product.price)) (Standard Jar)")
                        .font(.system(.title3, design: .serif))
                        .fontWeight(.bold)
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    
                    Text(product.description)
                        .font(.system(.body, design: .serif))
                        .foregroundColor(Color(white: 0.3))
                        .lineSpacing(4)
                    
                    Divider()
                        .padding(.vertical, 4)
                    
                    // Spiciness Indicator
                    HStack {
                        Text("Spiciness:")
                            .font(.system(.body, design: .serif))
                            .fontWeight(.medium)
                        
                        if product.spiciness > 0 {
                            HStack(spacing: 2) {
                                ForEach(0..<product.spiciness, id: \.self) { _ in
                                    Text("🌶️").font(.system(size: 14))
                                }
                            }
                        } else {
                            Text("Sweet (No spice)")
                                .font(.system(.body, design: .serif))
                        }
                    }
                    .padding(.vertical, 2)
                    
                    Divider()
                        .padding(.vertical, 4)
                    
                    // Flavor Radar Chart
                    VStack(alignment: .center, spacing: 8) {
                        Text("Flavor Profile Radar")
                            .font(.system(.body, design: .serif))
                            .fontWeight(.bold)
                            .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                        
                        FlavorRadarChartView(profile: product.flavorProfile)
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding(.vertical, 8)
                    }
                    
                    Divider()
                        .padding(.vertical, 8)
                    
                    // Buttons
                    VStack(spacing: 10) {
                        Button(action: {
                            if let index = cartItems.firstIndex(where: { $0.product.id == product.id }) {
                                cartItems[index].quantity += 1
                            } else {
                                cartItems.append(CartItem(product: product, quantity: 1))
                            }
                            dismiss()
                        }) {
                            Text("Add to Cart")
                                .font(.system(.headline, design: .serif))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                                .cornerRadius(12)
                        }
                        
                        Button(action: {
                            let message = "Hello Aunty! I would like to order: \(product.name) (x1) - ₹\(Int(product.price)). Please confirm."
                            if let encoded = message.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
                               let url = URL(string: "https://wa.me/919876543210?text=\(encoded)") {
                                UIApplication.shared.open(url)
                            }
                        }) {
                            Text("Order via WhatsApp")
                                .font(.system(.headline, design: .serif))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color(red: 37/255, green: 211/255, blue: 102/255))
                                .cornerRadius(12)
                        }
                    }
                    .padding(.top, 8)
                }
                .padding(16)
            }
        }
    }
}

// --- Canvas Drawn Placeholder Jar ---
struct CanvasJarPlaceholder: View {
    var body: some View {
        Canvas { context, size in
            let w = size.width
            let h = size.height
            
            // Background Shadow
            context.fill(
                Path(ellipseIn: CGRect(x: w * 0.15, y: h * 0.75, width: w * 0.7, height: h * 0.15)),
                with: .color(Color.black.opacity(0.12))
            )
            
            // Jar Body Path
            var jarPath = Path()
            jarPath.move(to: CGPoint(x: w * 0.3, y: h * 0.25))
            jarPath.addLine(to: CGPoint(x: w * 0.7, y: h * 0.25))
            jarPath.addQuadCurve(to: CGPoint(x: w * 0.85, y: h * 0.45), control: CGPoint(x: w * 0.85, y: h * 0.32))
            jarPath.addLine(to: CGPoint(x: w * 0.85, y: h * 0.8))
            jarPath.addQuadCurve(to: CGPoint(x: w * 0.75, y: h * 0.9), control: CGPoint(x: w * 0.85, y: h * 0.9))
            jarPath.addLine(to: CGPoint(x: w * 0.25, y: h * 0.9))
            jarPath.addQuadCurve(to: CGPoint(x: w * 0.15, y: h * 0.8), control: CGPoint(x: w * 0.15, y: h * 0.9))
            jarPath.addLine(to: CGPoint(x: w * 0.15, y: h * 0.45))
            jarPath.addQuadCurve(to: CGPoint(x: w * 0.3, y: h * 0.25), control: CGPoint(x: w * 0.15, y: h * 0.32))
            jarPath.closeSubpath()
            
            // Fill Jar with Pickle Content (Maroon gradient)
            let colors = [Color(red: 123/255, green: 28/255, blue: 28/255), Color(red: 62/255, green: 10/255, blue: 10/255)]
            let gradient = Gradient(colors: colors)
            context.fill(
                jarPath,
                with: .linearGradient(gradient, startPoint: CGPoint(x: w * 0.5, y: h * 0.3), endPoint: CGPoint(x: w * 0.5, y: h * 0.9))
            )
            
            // Glass reflection/border
            context.stroke(
                jarPath,
                with: .color(Color.white.opacity(0.18)),
                lineWidth: 3
            )
            
            // Gold Jar Lid Path
            var lidPath = Path()
            lidPath.move(to: CGPoint(x: w * 0.28, y: h * 0.15))
            lidPath.addLine(to: CGPoint(x: w * 0.72, y: h * 0.15))
            lidPath.addQuadCurve(to: CGPoint(x: w * 0.75, y: h * 0.25), control: CGPoint(x: w * 0.75, y: h * 0.15))
            lidPath.addLine(to: CGPoint(x: w * 0.25, y: h * 0.25))
            lidPath.addQuadCurve(to: CGPoint(x: w * 0.28, y: h * 0.15), control: CGPoint(x: w * 0.25, y: h * 0.15))
            lidPath.closeSubpath()
            
            let goldColors = [Color(red: 255/255, green: 215/255, blue: 0/255), Color(red: 184/255, green: 134/255, blue: 11/255)]
            context.fill(
                lidPath,
                with: .linearGradient(Gradient(colors: goldColors), startPoint: CGPoint(x: w * 0.5, y: h * 0.15), endPoint: CGPoint(x: w * 0.5, y: h * 0.25))
            )
            
            // Jar Label Path
            var labelPath = Path()
            labelPath.move(to: CGPoint(x: w * 0.28, y: h * 0.48))
            labelPath.addLine(to: CGPoint(x: w * 0.72, y: h * 0.48))
            labelPath.addLine(to: CGPoint(x: w * 0.72, y: h * 0.72))
            labelPath.addLine(to: CGPoint(x: w * 0.28, y: h * 0.72))
            labelPath.closeSubpath()
            
            context.fill(labelPath, with: .color(Color(white: 0.98)))
            context.stroke(labelPath, with: .color(Color(red: 154/255, green: 44/255, blue: 44/255)), lineWidth: 1)
        }
    }
}

// --- Canvas Drawn Radar Chart ---
struct FlavorRadarChart: View {
    let profile: FlavorProfile
    
    var body: some View {
        Canvas { context, size in
            let center = CGPoint(x: size.width / 2, y: size.height / 2)
            let radius = min(size.width, size.height) / 2.5
            let values = [profile.tangy, profile.sweet, profile.spicy, profile.savory, profile.salty]
            
            // 1. Draw web concentric pentagons
            for step in 1...5 {
                let stepRadius = radius * (Double(step) / 5.0)
                var path = Path()
                for i in 0..<5 {
                    let angle = Double(i) * 72.0 - 90.0
                    let radians = angle * .pi / 180.0
                    let x = center.x + CGFloat(stepRadius * cos(radians))
                    let y = center.y + CGFloat(stepRadius * sin(radians))
                    if i == 0 {
                        path.move(to: CGPoint(x: x, y: y))
                    } else {
                        path.addLine(to: CGPoint(x: x, y: y))
                    }
                }
                path.closeSubpath()
                context.stroke(path, with: .color(Color.black.opacity(0.08)), lineWidth: 1)
            }
            
            // 2. Draw axis lines
            for i in 0..<5 {
                let angle = Double(i) * 72.0 - 90.0
                let radians = angle * .pi / 180.0
                let endX = center.x + CGFloat(radius * cos(radians))
                let endY = center.y + CGFloat(radius * sin(radians))
                
                var linePath = Path()
                linePath.move(to: center)
                linePath.addLine(to: CGPoint(x: endX, y: endY))
                context.stroke(linePath, with: .color(Color.black.opacity(0.08)), lineWidth: 1)
            }
            
            // 3. Draw current flavor profile shape
            var fillPath = Path()
            for i in 0..<5 {
                let valPercent = Double(min(max(values[i], 0), 5)) / 5.0
                let valRadius = radius * valPercent
                let angle = Double(i) * 72.0 - 90.0
                let radians = angle * .pi / 180.0
                let x = center.x + CGFloat(valRadius * cos(radians))
                let y = center.y + CGFloat(valRadius * sin(radians))
                if i == 0 {
                    fillPath.move(to: CGPoint(x: x, y: y))
                } else {
                    fillPath.addLine(to: CGPoint(x: x, y: y))
                }
            }
            fillPath.closeSubpath()
            
            context.fill(fillPath, with: .color(Color(red: 154/255, green: 44/255, blue: 44/255).opacity(0.15)))
            context.stroke(fillPath, with: .color(Color(red: 154/255, green: 44/255, blue: 44/255)), lineWidth: 2)
        }
    }
}

struct FlavorRadarChartView: View {
    let profile: FlavorProfile
    let labels = ["Tangy", "Sweet", "Spicy", "Savory", "Salty"]
    
    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            let center = CGPoint(x: width / 2, y: height / 2)
            let radius = min(width, height) / 2.7
            
            ZStack {
                FlavorRadarChart(profile: profile)
                    .frame(width: width, height: height)
                
                ForEach(0..<5) { i in
                    let angle = Double(i) * 72.0 - 90.0
                    let radians = angle * .pi / 180.0
                    let labelRadius = radius + 20.0
                    let x = center.x + CGFloat(labelRadius * cos(radians))
                    let y = center.y + CGFloat(labelRadius * sin(radians))
                    
                    Text(labels[i])
                        .font(.system(size: 10, weight: .bold, design: .serif))
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                        .position(x: x, y: y)
                }
            }
        }
        .frame(width: 200, height: 200)
    }
}
