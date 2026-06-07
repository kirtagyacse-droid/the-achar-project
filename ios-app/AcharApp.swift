import SwiftUI

@main
struct AcharApp: App {
    @StateObject private var networkManager = NetworkManager()

    var body: some Scene {
        WindowGroup {
            MainLayoutView()
                .environmentObject(networkManager)
                .preferredColorScheme(.light)
        }
    }
}