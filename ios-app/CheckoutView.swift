import SwiftUI

struct CheckoutView: View {
    @EnvironmentObject var networkManager: NetworkManager
    @Binding var cartItems: [CartItem]
    
    let isGiftOrder: Bool
    let giftWrapType: String
    let giftMessageText: String
    
    @Environment(\.dismiss) var dismiss
    
    enum ActiveAlert: Identifiable {
        case warning, success
        var id: Int { hashValue }
    }
    @State private var activeAlert: ActiveAlert? = nil
    @State private var warningMessage = ""
    
    @State private var name = ""
    @State private var phone = ""
    @State private var altPhone = ""
    @State private var address = ""
    @State private var landmark = ""
    @State private var city = "Jaipur"
    @State private var state = "Rajasthan"
    @State private var pincode = ""
    @State private var notes = ""
    
    @State private var isSubmitting = false
    
    var baseTotal: Double {
        cartItems.reduce(0) { $0 + ($1.product.price * Double($1.quantity)) }
    }
    
    var packagingCost: Double {
        if isGiftOrder {
            return giftWrapType == "wood" ? 150.0 : 80.0
        }
        return 0.0
    }
    
    var grandTotal: Double {
        baseTotal + packagingCost
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    
                    if networkManager.isOffline {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("⚠️")
                                Text("You are currently offline. You can place the order via WhatsApp (doesn't require internet) or connect to sync.")
                                    .font(.system(.caption, design: .serif))
                                    .foregroundColor(Color(red: 230/255, green: 81/255, blue: 0/255))
                            }
                        }
                        .padding()
                        .background(Color(red: 255/255, green: 243/255, blue: 224/255))
                        .cornerRadius(8)
                        .padding(.horizontal)
                    }
                    
                    // Form fields
                    VStack(spacing: 12) {
                        TextField("Name *", text: $name)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(.body, design: .serif))
                        
                        TextField("Phone Number *", text: $phone)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(.body, design: .serif))
                            .keyboardType(.phonePad)
                        
                        TextField("Alternative Phone (Optional)", text: $altPhone)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(.body, design: .serif))
                            .keyboardType(.phonePad)
                        
                        ZStack(alignment: .topLeading) {
                            TextEditor(text: $address)
                                .frame(height: 80)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 6)
                                        .stroke(Color(white: 0.9), lineWidth: 1)
                                )
                            if address.isEmpty {
                                Text("Full Delivery Address *")
                                    .font(.system(.body, design: .serif))
                                    .foregroundColor(.gray)
                                    .padding(.leading, 6)
                                    .padding(.top, 8)
                                    .allowsHitTesting(false)
                            }
                        }
                        
                        TextField("Landmark (Optional)", text: $landmark)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(.body, design: .serif))
                        
                        HStack {
                            TextField("City *", text: $city)
                                .textFieldStyle(.roundedBorder)
                                .font(.system(.body, design: .serif))
                            
                            TextField("State *", text: $state)
                                .textFieldStyle(.roundedBorder)
                                .font(.system(.body, design: .serif))
                        }
                        
                        TextField("Pincode *", text: $pincode)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(.body, design: .serif))
                            .keyboardType(.numberPad)
                        
                        TextField("Delivery Instructions / Notes", text: $notes)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(.body, design: .serif))
                    }
                    .padding(.horizontal)
                    
                    // Summary block
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Order Summary")
                            .font(.system(.headline, design: .serif))
                            .fontWeight(.bold)
                            .foregroundColor(Color(red: 26/255, green: 26/255, blue: 26/255))
                            .padding(.bottom, 4)
                        
                        ForEach(cartItems) { item in
                            Text("• \(item.product.name) (x\(item.quantity)) - ₹\(Int(item.product.price * Double(item.quantity)))")
                                .font(.system(.body, design: .serif))
                                .foregroundColor(.gray)
                        }
                        
                        if isGiftOrder {
                            Text("• Gift Wrapping (\(giftWrapType.uppercased())) - ₹\(Int(packagingCost))")
                                .font(.system(.body, design: .serif))
                                .foregroundColor(.gray)
                        }
                        
                        Divider()
                            .padding(.vertical, 4)
                        
                        Text("Grand Total: ₹\(Int(grandTotal))")
                            .font(.system(.title3, design: .serif))
                            .fontWeight(.bold)
                            .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    }
                    .padding()
                    .background(Color(red: 250/255, green: 250/255, blue: 250/255))
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(white: 0.95), lineWidth: 1)
                    )
                    .padding(.horizontal)
                    
                    // Submit button
                    if isSubmitting {
                        HStack {
                            Spacer()
                            ProgressView("Placing order...")
                                .font(.system(.body, design: .serif))
                            Spacer()
                        }
                        .padding()
                    } else {
                        Button(action: {
                            if networkManager.isOffline {
                                placeWhatsAppOrder()
                            } else {
                                placeServerOrder()
                            }
                        }) {
                            Text(networkManager.isOffline ? "Place Order on WhatsApp" : "Place Order (Cash on Delivery)")
                                .font(.system(.headline, design: .serif))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(networkManager.isOffline ? Color(red: 37/255, green: 211/255, blue: 102/255) : Color(red: 154/255, green: 44/255, blue: 44/255))
                                .cornerRadius(12)
                        }
                        .buttonStyle(.plain)
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Checkout Details")
            .navigationBarItems(leading: Button("Cancel") {
                dismiss()
            })
            .alert(item: $activeAlert) { alert in
                switch alert {
                case .warning:
                    return Alert(title: Text("Missing Info"), message: Text(warningMessage), dismissButton: .default(Text("OK")))
                case .success:
                    return Alert(
                        title: Text("Success!"),
                        message: Text("Order placed successfully!"),
                        dismissButton: .default(Text("Done"), action: {
                            cartItems.removeAll()
                            dismiss()
                        })
                    )
                }
            }
        }
    }
    
    func placeWhatsAppOrder() {
        let orderList = cartItems.map { "• \($0.product.name) × \($0.quantity)" }.joined(separator: "\n")
        let wrapText = isGiftOrder ? "\n🎁 Gift wrapping selected: \(giftWrapType)" : ""
        let message = """
        🛒 New Order Request (Offline App)
        Name: \(name)
        Phone: \(phone)
        Address: \(address), \(landmark.isEmpty ? "" : landmark + ", ")\(city), \(state) - \(pincode)
        Items:
        \(orderList)\(wrapText)
        Total: ₹\(Int(grandTotal)) (COD)
        Notes: \(notes)
        """
        
        if let encoded = message.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
           let url = URL(string: "https://wa.me/919876543210?text=\(encoded)") {
            UIApplication.shared.open(url)
            activeAlert = .success
        }
    }
    
    func placeServerOrder() {
        if name.isEmpty || phone.isEmpty || address.isEmpty || pincode.isEmpty {
            warningMessage = "Please fill in all required fields (Name, Phone, Address, Pincode)"
            activeAlert = .warning
            return
        }
        
        isSubmitting = true
        
        let itemsJson = cartItems.map { item -> [String: Any] in
            return [
                "productId": item.product.id,
                "quantity": item.quantity,
                "price": item.product.price
            ]
        }
        
        networkManager.submitOrder(
            name: name,
            phone: phone,
            altPhone: altPhone.isEmpty ? nil : altPhone,
            address: address,
            landmark: landmark.isEmpty ? nil : landmark,
            city: city,
            state: state,
            pincode: pincode,
            notes: notes.isEmpty ? nil : notes,
            totalAmount: grandTotal,
            isGiftOrder: isGiftOrder,
            giftPackaging: giftWrapType,
            giftMessage: giftMessageText.isEmpty ? nil : giftMessageText,
            items: itemsJson
        ) { result in
            isSubmitting = false
            switch result {
            case .success(let statusCode):
                if statusCode == 200 || statusCode == 201 {
                    activeAlert = .success
                } else {
                    warningMessage = "Failed to submit order. Server code: \(statusCode)"
                    activeAlert = .warning
                }
            case .failure(let error):
                print("Checkout error: \(error.localizedDescription)")
                warningMessage = "Failed to send order: \(error.localizedDescription)"
                activeAlert = .warning
            }
        }
    }
}