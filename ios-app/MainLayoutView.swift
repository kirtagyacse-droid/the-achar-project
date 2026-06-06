import SwiftUI

struct MainLayoutView: View {
    @EnvironmentObject var networkManager: NetworkManager
    @State private var currentScreen: Screen = .catalog
    @State private var cartItems: [CartItem] = []
    @State private var showCartSheet = false
    @State private var devTapCount = 0
    @State private var showDevDialog = false
    
    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                // Header (Centered Logo & Text)
                VStack(spacing: 4) {
                    Image(systemName: "leaf.fill") // Fallback, normally "logo" asset
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 36, height: 36)
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                        .padding(.top, 8)
                        .onTapGesture {
                            devTapCount += 1
                            if devTapCount >= 5 {
                                showDevDialog = true
                                devTapCount = 0
                            }
                        }
                    
                    Text("RS SAVOURY")
                        .font(.system(.footnote, design: .serif))
                        .fontWeight(.black)
                        .kerning(1.5)
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                }
                .padding(.bottom, 8)
                .frame(maxWidth: .infinity)
                .background(Color.white)
                .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 2)
                
                // Screen Content Area
                ZStack {
                    switch currentScreen {
                    case .catalog:
                        CatalogView(cartItems: $cartItems, showCartSheet: $showCartSheet)
                    case .quiz:
                        Color.white.overlay(Text("Flavor Quiz Screen").font(.headline))
                    case .passport:
                        Color.white.overlay(Text("Achar Passport Screen").font(.headline))
                    case .returns:
                        Color.white.overlay(Text("Circular Returns Screen").font(.headline))
                    case .diary:
                        Color.white.overlay(Text("Achar Diary Screen").font(.headline))
                    case .admin:
                        AdminView()
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                
                // Bottom Telegram-style Navigation Strip
                HStack(spacing: 0) {
                    ForEach(Screen.allCases, id: \.self) { screen in
                        Button(action: {
                            currentScreen = screen
                        }) {
                            VStack(spacing: 4) {
                                Image(systemName: screen.iconName)
                                    .font(.system(size: 18))
                                    .foregroundColor(currentScreen == screen ? Color(red: 154/255, green: 44/255, blue: 44/255) : .gray)
                                
                                Text(screen.rawValue)
                                    .font(.system(size: 10, weight: currentScreen == screen ? .bold : .regular))
                                    .foregroundColor(currentScreen == screen ? Color(red: 154/255, green: 44/255, blue: 44/255) : .gray)
                                
                                // Elegant indicator underline
                                Capsule()
                                    .fill(currentScreen == screen ? Color(red: 154/255, green: 44/255, blue: 44/255) : Color.clear)
                                    .frame(width: 20, height: 2)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .background(Color.white)
                .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: -4)
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
                                    .font(.title3)
                                Text("\(cartItems.reduce(0) { $0 + $1.quantity })")
                                    .font(.system(size: 14, weight: .bold))
                            }
                            .padding(.horizontal, 20)
                            .padding(.vertical, 14)
                            .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                            .foregroundColor(.white)
                            .clipShape(Capsule())
                            .shadow(color: Color.black.opacity(0.2), radius: 6, x: 0, y: 3)
                        }
                        .padding(.trailing, 20)
                        .padding(.bottom, 70) // Ensure it hovers perfectly above the bottom bar
                    }
                }
            }
        }
        .sheet(isPresented: $showCartSheet) {
            CartSheetView(cartItems: $cartItems)
        }
        .alert(isPresented: $showDevDialog) {
            Alert(
                title: Text("Developer Mode"),
                message: Text("Change Backend target host context if needed."),
                primaryButton: .default(Text("Reset"), action: {
                    networkManager.apiBaseUrl = "https://rssavoury.com"
                }),
                secondaryButton: .cancel()
            )
        }
    }
}
