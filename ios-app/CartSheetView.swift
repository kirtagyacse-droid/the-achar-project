import SwiftUI

struct CartSheetView: View {
    @EnvironmentObject var networkManager: NetworkManager
    @Binding var cartItems: [CartItem]
    @Environment(\.dismiss) var dismiss
    
    @State private var isGiftWrap = false
    @State private var giftWrapType = "cloth" // "cloth" or "wood"
    @State private var giftMessage = ""
    @State private var showCheckoutSuccess = false
    
    var subtotal: Double {
        cartItems.reduce(0) { $0 + ($1.product.price * Double($1.quantity)) }
    }
    
    var giftCost: Double {
        if isGiftWrap {
            return giftWrapType == "wood" ? 150.0 : 80.0
        }
        return 0.0
    }
    
    var total: Double {
        subtotal + giftCost
    }
    
    var body: some View {
        NavigationView {
            VStack {
                if cartItems.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "cart")
                            .font(.system(size: 64))
                            .foregroundColor(.gray)
                        Text("Your cart is empty")
                            .font(.headline)
                        Button("Start Shopping") {
                            dismiss()
                        }
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    }
                    .padding()
                } else {
                    List {
                        Section(header: Text("Items")) {
                            ForEach(cartItems) { item in
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(item.product.name)
                                            .fontWeight(.semibold)
                                        Text("₹\(Int(item.product.price)) x \(item.quantity)")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    Spacer()
                                    
                                    // Quantity Controls
                                    HStack(spacing: 12) {
                                        Button(action: {
                                            if let index = cartItems.firstIndex(where: { $0.id == item.id }) {
                                                if cartItems[index].quantity > 1 {
                                                    cartItems[index].quantity -= 1
                                                } else {
                                                    cartItems.remove(at: index)
                                                }
                                            }
                                        }) {
                                            Image(systemName: "minus.circle.fill")
                                                .foregroundColor(.gray)
                                        }
                                        
                                        Text("\(item.quantity)")
                                            .fontWeight(.bold)
                                        
                                        Button(action: {
                                            if let index = cartItems.firstIndex(where: { $0.id == item.id }) {
                                                cartItems[index].quantity += 1
                                            }
                                        }) {
                                            Image(systemName: "plus.circle.fill")
                                                .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                                        }
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        
                        // Gifting Add-ons
                        Section(header: Text("Gifting Option (Indian Potli / Pine Wood Box)")) {
                            Toggle(isOn: $isGiftWrap) {
                                HStack {
                                    Image(systemName: "gift.fill")
                                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                                    Text("Add premium gift wrapping")
                                }
                            }
                            
                            if isGiftWrap {
                                Picker("Wrap Type", selection: $giftWrapType) {
                                    Text("Traditional Cloth Potli (+₹80)").tag("cloth")
                                    Text("Handcrafted Pine Wood Box (+₹150)").tag("wood")
                                }
                                .pickerStyle(.segmented)
                                
                                TextField("Enter a personal gift note...", text: $giftMessage)
                                    .textFieldStyle(.roundedBorder)
                                    .padding(.vertical, 4)
                            }
                        }
                        
                        // Pricing summary
                        Section(header: Text("Summary")) {
                            HStack {
                                Text("Subtotal")
                                Spacer()
                                Text("₹\(Int(subtotal))")
                            }
                            if isGiftWrap {
                                HStack {
                                    Text("Gift Wrapping (\(giftWrapType.capitalized))")
                                    Spacer()
                                    Text("₹\(Int(giftCost))")
                                }
                            }
                            HStack {
                                Text("Total Amount")
                                    .fontWeight(.bold)
                                Spacer()
                                Text("₹\(Int(total))")
                                    .fontWeight(.bold)
                                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                            }
                        }
                    }
                    
                    // Checkout Button
                    Button(action: {
                        showCheckoutSuccess = true
                    }) {
                        Text("Proceed to Checkout")
                            .font(.system(.headline, design: .serif))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                            .cornerRadius(12)
                            .padding(16)
                    }
                }
            }
            .navigationTitle("Shopping Cart")
            .navigationBarItems(trailing: Button("Close") {
                dismiss()
            })
            .sheet(isPresented: $showCheckoutSuccess) {
                CheckoutView(
                    cartItems: $cartItems,
                    isGiftOrder: isGiftWrap,
                    giftWrapType: giftWrapType,
                    giftMessageText: giftMessage
                )
                .environmentObject(networkManager)
            }
        }
    }
}
