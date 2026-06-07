import SwiftUI

struct ReturnsView: View {
    @State private var name = ""
    @State private var phone = ""
    @State private var jarsCount = "5"
    @State private var address = ""
    @State private var showWarning = false
    @State private var warningMessage = ""
    
    var body: some View {
        ScrollView {
            VStack(alignment: .center, spacing: 20) {
                Text("Glass Jar Return Program")
                    .font(.system(.title, design: .serif))
                    .fontWeight(.black)
                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    .multilineTextAlignment(.center)
                    .padding(.top, 16)
                
                Text("Return 5 or more empty jars and get ₹100 flat store credit on your next jar purchase!")
                    .font(.system(.body, design: .serif))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                VStack(spacing: 16) {
                    TextField("Name", text: $name)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(.body, design: .serif))
                    
                    TextField("Phone Number", text: $phone)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(.body, design: .serif))
                        .keyboardType(.phonePad)
                    
                    TextField("Number of Jars (Min. 5)", text: $jarsCount)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(.body, design: .serif))
                        .keyboardType(.numberPad)
                    
                    ZStack(alignment: .topLeading) {
                        TextEditor(text: $address)
                            .frame(height: 100)
                            .overlay(
                                RoundedRectangle(cornerRadius: 6)
                                    .stroke(Color(white: 0.9), lineWidth: 1)
                            )
                        if address.isEmpty {
                            Text("Pickup Address")
                                .font(.system(.body, design: .serif))
                                .foregroundColor(.gray)
                                .padding(.leading, 6)
                                .padding(.top, 8)
                                .allowsHitTesting(false)
                        }
                    }
                }
                .padding(.horizontal)
                
                Button(action: {
                    guard let jars = Int(jarsCount), jars >= 5 else {
                        warningMessage = "Minimum 5 jars required to claim credit"
                        showWarning = true
                        return
                    }
                    
                    if name.isEmpty || phone.isEmpty || address.isEmpty {
                        warningMessage = "Please fill in all details"
                        showWarning = true
                        return
                    }
                    
                    let message = """
                    ♻️ Empty Jar Return Pickup Request
                    Name: \(name)
                    Phone: \(phone)
                    Jars Count: \(jars)
                    Pickup Address: \(address)
                    """
                    
                    if let encoded = message.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
                       let url = URL(string: "https://wa.me/919876543210?text=\(encoded)") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    Text("Request Return Pickup")
                        .font(.system(.headline, design: .serif))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                        .cornerRadius(12)
                }
                .buttonStyle(.plain)
                .padding(.horizontal)
                .padding(.top, 10)
                .padding(.bottom, 80) // bottom bar padding buffer
            }
        }
        .background(Color.white)
        .alert(isPresented: $showWarning) {
            Alert(title: Text("Notice"), message: Text(warningMessage), dismissButton: .default(Text("OK")))
        }
    }
}
