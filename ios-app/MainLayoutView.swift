import SwiftUI

struct MainLayoutView: View {
    @EnvironmentObject var networkManager: NetworkManager
    @State private var currentScreen: Screen = .catalog
    @State private var cartItems: [CartItem] = []
    @State private var showCartSheet = false
    @State private var devTapCount = 0
    @State private var showDevDialog = false
    @State private var selectedProduct: Product? = nil
    
    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                // Header (Centered Logo & Text)
                VStack(spacing: 4) {
                    Image(systemName: "leaf.fill")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 32, height: 32)
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                        .padding(.top, 8)
                        .onTapGesture {
                            devTapCount += 1
                            if devTapCount >= 5 {
                                showDevDialog = true
                                devTapCount = 0
                            }
                        }
                    
                    Text("THE ACHAR PROJECT")
                        .font(.system(.footnote, design: .serif))
                        .fontWeight(.black)
                        .kerning(1.5)
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    
                    Text("JAIPUR")
                        .font(.system(size: 8, weight: .bold, design: .sansSerif))
                        .kerning(3.0)
                        .foregroundColor(.gray)
                }
                .padding(.bottom, 8)
                .frame(maxWidth: .infinity)
                .background(Color.white)
                .shadow(color: Color.black.opacity(0.04), radius: 3, x: 0, y: 2)
                
                // Screen Content Area
                ZStack {
                    switch currentScreen {
                    case .catalog:
                        CatalogView(cartItems: $cartItems, showCartSheet: $showCartSheet, selectedProduct: $selectedProduct)
                    case .quiz:
                        FlavorQuizView(productsList: networkManager.products) { prod in
                            selectedProduct = prod
                            currentScreen = .catalog
                        }
                    case .passport:
                        PassportView(productsList: networkManager.products)
                    case .returns:
                        ReturnsView()
                    case .diary:
                        DiaryView()
                    case .admin:
                        AdminView()
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                
                // Bottom Capsule Navigation Strip (floating look, clears home indicator)
                HStack(spacing: 0) {
                    ForEach(Screen.allCases, id: \.self) { screen in
                        Button(action: {
                            currentScreen = screen
                        }) {
                            VStack(spacing: 4) {
                                Image(systemName: screen.iconName)
                                    .font(.system(size: 16))
                                    .foregroundColor(currentScreen == screen ? Color(red: 154/255, green: 44/255, blue: 44/255) : .gray)
                                
                                Text(screen.rawValue)
                                    .font(.system(size: 9, weight: currentScreen == screen ? .bold : .regular, design: .serif))
                                    .foregroundColor(currentScreen == screen ? Color(red: 154/255, green: 44/255, blue: 44/255) : .gray)
                                
                                // Elegant indicator underline
                                Capsule()
                                    .fill(currentScreen == screen ? Color(red: 154/255, green: 44/255, blue: 44/255) : Color.clear)
                                    .frame(width: 16, height: 2)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .background(Color.white)
                .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: -4)
            }
            
            // Cart floating action button overlay
            if !cartItems.isEmpty && !showCartSheet {
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Button(action: { showCartSheet = true }) {
                            HStack(spacing: 8) {
                                Image(systemName: "cart.fill")
                                    .font(.system(size: 16, weight: .bold))
                                Text("\(cartItems.reduce(0) { $0 + $1.quantity })")
                                    .font(.system(size: 13, weight: .bold, design: .serif))
                            }
                            .padding(.horizontal, 18)
                            .padding(.vertical, 12)
                            .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                            .foregroundColor(.white)
                            .clipShape(Capsule())
                            .shadow(color: Color.black.opacity(0.15), radius: 6, x: 0, y: 3)
                        }
                        .padding(.trailing, 16)
                        .padding(.bottom, 72)
                    }
                }
            }
        }
        .sheet(isPresented: $showCartSheet) {
            CartSheetView(cartItems: $cartItems)
                .environmentObject(networkManager)
        }
        .sheet(item: $selectedProduct) { product in
            ProductDetailView(product: product, cartItems: $cartItems)
                .environmentObject(networkManager)
        }
        .sheet(isPresented: $showDevDialog) {
            devSettingsView()
        }
    }
    
    @ViewBuilder
    func devSettingsView() -> some View {
        NavigationView {
            Form {
                Section(header: Text("Target API Server")) {
                    Button("Set to Production Vercel") {
                        networkManager.apiBaseUrl = "https://the-achar-project.vercel.app"
                        showDevDialog = false
                    }
                    Button("Set to Local Laptop Server") {
                        networkManager.apiBaseUrl = "http://localhost:3000"
                        showDevDialog = false
                    }
                    
                    HStack {
                        Text("Current:")
                        Spacer()
                        Text(networkManager.apiBaseUrl)
                            .foregroundColor(.gray)
                            .font(.system(.caption, design: .monospaced))
                    }
                }
            }
            .navigationTitle("Developer Configuration")
            .navigationBarItems(trailing: Button("Close") {
                showDevDialog = false
            })
        }
    }
}
