import SwiftUI

struct AdminView: View {
    @EnvironmentObject var networkManager: NetworkManager
    @State private var pinCode = ""
    @State private var isAuthenticated = false
    @State private var showError = false
    
    var body: some View {
        VStack {
            if !isAuthenticated {
                VStack(spacing: 20) {
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 64))
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    
                    Text("Admin Access Required")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    SecureField("Enter Admin PIN", text: $pinCode)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.numberPad)
                        .frame(width: 200)
                        .multilineTextAlignment(.center)
                    
                    Button("Unlock") {
                        if pinCode == "0000" { // Example PIN, matches the web portal setup
                            isAuthenticated = true
                            showError = false
                        } else {
                            showError = true
                        }
                    }
                    .padding(.horizontal, 32)
                    .padding(.vertical, 10)
                    .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    
                    if showError {
                        Text("Invalid PIN code. Try again.")
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }
                .padding()
            } else {
                List {
                    Section(header: Text("Inventory Quick Adjust")) {
                        ForEach(networkManager.products) { product in
                            HStack {
                                Text(product.name)
                                    .font(.system(size: 14, weight: .medium))
                                Spacer()
                                Text("\(product.stockCount) left")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    
                    Section {
                        Button("Log Out") {
                            isAuthenticated = false
                            pinCode = ""
                        }
                        .foregroundColor(.red)
                    }
                }
                .navigationTitle("Admin Controls")
            }
        }
    }
}
