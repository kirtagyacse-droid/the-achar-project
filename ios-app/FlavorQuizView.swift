import SwiftUI

struct FlavorQuizView: View {
    let productsList: [Product]
    let onSelectRecommended: (Product) -> Void
    
    @State private var step = 1
    @State private var prefSpice = 2 // 1: Mild, 2: Medium, 3: Spicy
    @State private var prefSweetSour = "sour" // "sweet", "sour", "both"
    
    var quizMatches: [Product] {
        productsList.filter { product in
            let spicinessMatch = abs(product.spiciness - prefSpice) <= 1
            let profileMatch: Bool
            if prefSweetSour == "sour" {
                profileMatch = product.flavorProfile.tangy >= 3
            } else if prefSweetSour == "sweet" {
                profileMatch = product.flavorProfile.sweet >= 3
            } else {
                profileMatch = true
            }
            return spicinessMatch && profileMatch
        }
    }
    
    var quizBestMatch: Product? {
        quizMatches.first ?? productsList.first
    }
    
    var body: some View {
        VStack {
            Spacer()
            
            VStack(spacing: 20) {
                VStack(spacing: 16) {
                    Text("Aunty's Flavor Finder")
                        .font(.system(.title2, design: .serif))
                        .fontWeight(.black)
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                        .multilineTextAlignment(.center)
                    
                    if step == 1 {
                        Text("Step 1: Select your preferred spiciness level:")
                            .font(.system(.body, design: .serif))
                            .foregroundColor(Color(white: 0.1))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        VStack(spacing: 12) {
                            Button(action: {
                                prefSpice = 1
                                step = 2
                            }) {
                                Text("🌶️ Mild / Sweet-Spicy")
                                    .font(.system(.body, design: .serif))
                                    .fontWeight(.bold)
                                    .foregroundColor(Color(white: 0.1))
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color(white: 0.95))
                                    .cornerRadius(8)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(Color(white: 0.9), lineWidth: 1)
                                    )
                            }
                            .buttonStyle(.plain)
                            
                            Button(action: {
                                prefSpice = 2
                                step = 2
                            }) {
                                Text("🌶️🌶️ Medium Hot")
                                    .font(.system(.body, design: .serif))
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                                    .cornerRadius(8)
                            }
                            .buttonStyle(.plain)
                            
                            Button(action: {
                                prefSpice = 3
                                step = 2
                            }) {
                                Text("🌶️🌶️🌶️ Extra Hot")
                                    .font(.system(.body, design: .serif))
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color(red: 198/255, green: 40/255, blue: 40/255))
                                    .cornerRadius(8)
                            }
                            .buttonStyle(.plain)
                        }
                        .padding(.horizontal)
                    } else if step == 2 {
                        Text("Step 2: Do you prefer Sweet or Sour pickle profiles?")
                            .font(.system(.body, design: .serif))
                            .foregroundColor(Color(white: 0.1))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        VStack(spacing: 12) {
                            Button(action: {
                                prefSweetSour = "sour"
                                step = 3
                            }) {
                                Text("Tangy & Sour")
                                    .font(.system(.body, design: .serif))
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                                    .cornerRadius(8)
                            }
                            .buttonStyle(.plain)
                            
                            Button(action: {
                                prefSweetSour = "sweet"
                                step = 3
                            }) {
                                Text("Sweet & Sour / Gur-Based")
                                    .font(.system(.body, design: .serif))
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                                    .cornerRadius(8)
                            }
                            .buttonStyle(.plain)
                            
                            Button(action: {
                                prefSweetSour = "both"
                                step = 3
                            }) {
                                Text("Balanced / Both")
                                    .font(.system(.body, design: .serif))
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                                    .cornerRadius(8)
                            }
                            .buttonStyle(.plain)
                        }
                        .padding(.horizontal)
                    } else {
                        if let match = quizBestMatch {
                            VStack(spacing: 12) {
                                Text("Aunty's Personal Recommendation for you:")
                                    .font(.system(.body, design: .serif))
                                    .fontWeight(.semibold)
                                    .foregroundColor(Color(white: 0.1))
                                    .multilineTextAlignment(.center)
                                
                                CanvasJarPlaceholder()
                                    .frame(width: 85, height: 85)
                                    .padding(8)
                                
                                Text(match.name)
                                    .font(.system(.headline, design: .serif))
                                    .fontWeight(.bold)
                                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                                    .multilineTextAlignment(.center)
                                
                                Text(match.description)
                                    .font(.system(.caption, design: .serif))
                                    .foregroundColor(.gray)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal)
                                    .lineSpacing(2)
                                
                                Button(action: {
                                    onSelectRecommended(match)
                                }) {
                                    Text("View Details & Add")
                                        .font(.system(.body, design: .serif))
                                        .fontWeight(.bold)
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 24)
                                        .padding(.vertical, 10)
                                        .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                                        .cornerRadius(8)
                                }
                                .buttonStyle(.plain)
                                .padding(.top, 8)
                            }
                        } else {
                            Text("No matching products found.")
                                .font(.system(.body, design: .serif))
                                .foregroundColor(.gray)
                        }
                        
                        Button(action: {
                            step = 1
                        }) {
                            Text("Retake Quiz")
                                .font(.system(.footnote, design: .serif))
                                .foregroundColor(.gray)
                                .underline()
                        }
                        .buttonStyle(.plain)
                        .padding(.top, 8)
                    }
                }
                .padding(.vertical, 24)
                .background(Color(red: 250/255, green: 250/255, blue: 250/255))
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color(white: 0.95), lineWidth: 1)
                )
                .padding()
            }
            
            Spacer()
        }
        .background(Color.white)
    }
}