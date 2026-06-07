import SwiftUI

struct DiaryStory: Identifiable {
    let id = UUID()
    let title: String
    let content: String
}

struct DiaryView: View {
    let stories = [
        DiaryStory(
            title: "Sourcing Raw Keri (Mangoes)",
            content: "We source our Keri (Mangoes) raw directly from orchards in Chomu, Jaipur. They are checked for firm pulp and perfect tanginess to withstand solar curing."
        ),
        DiaryStory(
            title: "Sun Drying under Jaipur Sun",
            content: "Our spices are ground locally, mixed with sun-dried mango slices, and layered in glass jars. They are cured on terrace stands under direct sunlight for 14-21 days."
        ),
        DiaryStory(
            title: "Traditional Mustard Oil Layering",
            content: "Pure mustard oil is heated, cooled, and layered over cured pickles. This seals in flavor and naturally preserves the pickle for years without synthetic agents."
        )
    ]
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Aunty's Diary")
                    .font(.system(.title, design: .serif))
                    .fontWeight(.black)
                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    .padding(.horizontal)
                    .padding(.top, 16)
                
                ForEach(stories) { story in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(story.title)
                            .font(.system(.headline, design: .serif))
                            .fontWeight(.bold)
                            .foregroundColor(Color(red: 26/255, green: 26/255, blue: 26/255))
                        
                        Text(story.content)
                            .font(.system(.body, design: .serif))
                            .foregroundColor(Color(white: 0.35))
                            .lineSpacing(4)
                    }
                    .padding(16)
                    .background(Color(red: 250/255, green: 250/255, blue: 250/255))
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(white: 0.95), lineWidth: 1)
                    )
                    .padding(.horizontal)
                }
            }
            .padding(.bottom, 80) // buffer
        }
        .background(Color.white)
    }
}
