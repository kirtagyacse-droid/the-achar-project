import SwiftUI

struct PassportView: View {
    let productsList: [Product]
    
    var passportTotal: Int { max(productsList.count, 1) }
    var passportUnlocked: Int { 1 }
    var passportProgress: Double { Double(passportUnlocked) / Double(passportTotal) }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .center, spacing: 20) {
                Text("Your Achar Passport")
                    .font(.system(.title, design: .serif))
                    .fontWeight(.black)
                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    .padding(.top, 16)
                
                Text("Try all flavors to claim a free premium jar from Aunty!")
                    .font(.system(.caption, design: .serif))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                // 3-column Grid
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(productsList) { prod in
                        VStack(spacing: 8) {
                            ZStack(alignment: .center) {
                                CanvasJarPlaceholder()
                                    .frame(width: 50, height: 50)
                                    .opacity(prod.id == "1" ? 1.0 : 0.4) // highlight tried one
                                
                                if prod.id == "1" {
                                    Image(systemName: "checkmark.seal.fill")
                                        .font(.title3)
                                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                                        .background(Circle().fill(Color.white).frame(width: 14, height: 14))
                                        .offset(x: 15, y: 15)
                                }
                            }
                            
                            // Product short name
                            Text(prod.name.components(separatedBy: " ").first ?? "")
                                .font(.system(size: 11, weight: .bold, design: .serif))
                                .foregroundColor(Color(white: 0.2))
                                .lineLimit(1)
                            
                            if prod.id == "1" {
                                Text("UNLOCKED")
                                    .font(.system(size: 8, weight: .black))
                                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                            } else {
                                Text("LOCKED")
                                    .font(.system(size: 8, weight: .bold))
                                    .foregroundColor(.gray)
                            }
                        }
                        .padding(.vertical, 12)
                        .background(Color(red: 250/255, green: 250/255, blue: 250/255))
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color(white: 0.95), lineWidth: 1)
                        )
                    }
                }
                .padding(.horizontal)
                
                // Progress Card
                VStack(spacing: 12) {
                    Text("Stamps Unlocked: \(passportUnlocked) / \(passportTotal)")
                        .font(.system(.body, design: .serif))
                        .fontWeight(.bold)
                        .foregroundColor(Color(white: 0.1))
                    
                    ProgressView(value: passportProgress)
                        .accentColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                        .scaleEffect(x: 1, y: 1.5, anchor: .center)
                        .padding(.horizontal)
                }
                .padding()
                .background(Color(red: 250/255, green: 250/255, blue: 250/255))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color(white: 0.95), lineWidth: 1)
                )
                .padding(.horizontal)
                .padding(.bottom, 80) // buffer
            }
        }
        .background(Color.white)
    }
}