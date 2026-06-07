import SwiftUI
import PhotosUI

// --- Codable Models for Admin Dashboard ---
struct AdminDashboardData: Codable {
    let orders: [AdminOrder]
    let products: [Product]
    let subscriptions: [AdminSubscription]
    let passports: [AdminPassport]
    let jarReturns: [AdminJarReturn]
    let referrals: [AdminReferral]
}

struct AdminOrder: Identifiable, Codable {
    let id: String
    let customerName: String
    let phone: String
    let altPhone: String?
    let address: String
    let landmark: String?
    let city: String
    let state: String
    let pincode: String
    let notes: String?
    let totalAmount: Double
    let status: String
    let paymentMethod: String
    let isGiftOrder: Bool
    let giftMessage: String?
    let giftPackaging: String?
    let dispatchPhotoUrl: String?
    let items: [AdminOrderItem]
}

struct AdminOrderItem: Identifiable, Codable {
    let id: String
    let productId: String
    let quantity: Int
    let price: Double
    let product: Product
}

struct AdminSubscription: Identifiable, Codable {
    let id: String
    let customerName: String
    let phone: String
    let email: String?
    let address: String
    let planJars: Int
    let isActive: Bool
    let notes: String?
}

struct AdminPassport: Identifiable, Codable {
    let id: String
    let phone: String
    let customerName: String
    let stamps: [String]
    let isComplete: Bool
    let freeJarClaimed: Bool
}

struct AdminJarReturn: Identifiable, Codable {
    let id: String
    let phone: String
    let customerName: String
    let jarCount: Int
    let discountApplied: Bool
}

struct AdminReferral: Identifiable, Codable {
    let id: String
    let referrerPhone: String
    let referrerName: String
    let referralCode: String
    let usedByPhone: String?
    let usedByName: String?
    let isUsed: Bool
}

struct AdminView: View {
    @EnvironmentObject var networkManager: NetworkManager
    @State private var password = ""
    @State private var isAuthenticated = false
    @State private var isSubmitting = false
    @State private var showError = false
    
    @State private var selectedTab = "orders"
    @State private var dashboardData: AdminDashboardData? = nil
    @State private var isLoadingData = false
    @State private var syncError: String? = nil
    
    // Product Dialog States
    @State private var showProductSheet = false
    @State private var editingProduct: Product? = nil // null = add product
    @State private var prodName = ""
    @State private var prodDesc = ""
    @State private var prodPrice = ""
    @State private var prodImgUrl = ""
    @State private var prodCategory = "Pickle"
    @State private var prodStockStatus = "IN_STOCK"
    @State private var prodStockCount = "10"
    @State private var prodSpiciness = 2
    
    // Photo upload states
    @State private var selectedPhotoItem: PhotosPickerItem? = nil
    @State private var uploadingOrderId: String? = nil
    @State private var isUploadingPhoto = false
    
    var body: some View {
        VStack(spacing: 0) {
            if !isAuthenticated {
                VStack(spacing: 20) {
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 64))
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    
                    Text("Admin Access Required")
                        .font(.system(.title2, design: .serif))
                        .fontWeight(.bold)
                    
                    SecureField("Enter Admin Password", text: $password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .frame(width: 250)
                        .multilineTextAlignment(.center)
                    
                    if isSubmitting {
                        ProgressView()
                    } else {
                        Button(action: loginToAdmin) {
                            Text("Unlock")
                                .font(.system(.body, design: .serif))
                                .fontWeight(.bold)
                                .padding(.horizontal, 32)
                                .padding(.vertical, 10)
                                .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                    
                    if showError {
                        Text("Incorrect password, please try again.")
                            .font(.system(.caption, design: .serif))
                            .foregroundColor(.red)
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.white)
            } else {
                // Top Custom Header
                HStack {
                    Text("Admin Panel")
                        .font(.system(.title2, design: .serif))
                        .fontWeight(.black)
                        .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                    
                    Spacer()
                    
                    if isLoadingData {
                        ProgressView().padding(.trailing, 8)
                    } else {
                        Button(action: fetchDashboardData) {
                            Image(systemName: "arrow.clockwise")
                                .font(.body)
                                .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                        }
                    }
                    
                    Button("Logout") {
                        isAuthenticated = false
                        password = ""
                        dashboardData = nil
                    }
                    .font(.system(.body, design: .serif))
                    .foregroundColor(.red)
                    .padding(.leading, 12)
                }
                .padding()
                .background(Color.white)
                .overlay(
                    Rectangle().frame(height: 1).foregroundColor(Color(white: 0.9)), alignment: .bottom
                )
                
                // Tab Selection Strip
                HStack(spacing: 0) {
                    ForEach([("orders", "Orders"), ("products", "Products"), ("other", "Other")], id: \.0) { tabKey, tabLabel in
                        Button(action: { selectedTab = tabKey }) {
                            VStack(spacing: 6) {
                                Text(tabLabel)
                                    .font(.system(size: 14, weight: selectedTab == tabKey ? .bold : .medium, design: .serif))
                                    .foregroundColor(selectedTab == tabKey ? Color(red: 154/255, green: 44/255, blue: 44/255) : .gray)
                                
                                Rectangle()
                                    .fill(selectedTab == tabKey ? Color(red: 154/255, green: 44/255, blue: 44/255) : Color.clear)
                                    .frame(width: 40, height: 2)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .background(Color.white)
                .overlay(
                    Rectangle().frame(height: 1).foregroundColor(Color(white: 0.95)), alignment: .bottom
                )
                
                // Dashboard Data display
                if let err = syncError {
                    VStack(spacing: 12) {
                        Text("⚠️ Sync Error")
                            .font(.headline)
                            .foregroundColor(.red)
                        Text(err)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                        Button("Retry") {
                            fetchDashboardData()
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 8)
                        .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .padding()
                    .frame(maxHeight: .infinity)
                } else if let data = dashboardData {
                    ScrollView {
                        VStack(spacing: 16) {
                            if selectedTab == "orders" {
                                ordersTabView(data: data)
                            } else if selectedTab == "products" {
                                productsTabView(data: data)
                            } else {
                                otherTabView(data: data)
                            }
                        }
                        .padding()
                        .padding(.bottom, 80) // bottom padding buffer
                    }
                    .background(Color(white: 0.98))
                } else {
                    ProgressView("Loading Dashboard Data...")
                        .frame(maxHeight: .infinity)
                }
            }
        }
        .sheet(isPresented: $showProductSheet) {
            productUpsertSheet()
        }
        .onChange(of: selectedPhotoItem) { newItem in
            guard let item = newItem, let orderId = uploadingOrderId else { return }
            Task {
                if let photoData = try? await item.loadTransferable(type: Data.self) {
                    uploadPhoto(orderId: orderId, data: photoData)
                }
                uploadingOrderId = nil
                selectedPhotoItem = nil
            }
        }
    }
    
    // --- Authentication ---
    func loginToAdmin() {
        guard let url = URL(string: "\(networkManager.apiBaseUrl)/api/admin/login") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let bodyJson = ["password": password]
        request.httpBody = try? JSONSerialization.data(withJSONObject: bodyJson, options: [])
        
        isSubmitting = true
        showError = false
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                isSubmitting = false
                if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                    isAuthenticated = true
                    fetchDashboardData()
                } else {
                    showError = true
                }
            }
        }.resume()
    }
    
    // --- Fetch Dashboard Data ---
    func fetchDashboardData() {
        guard let url = URL(string: "\(networkManager.apiBaseUrl)/api/admin/dashboard") else { return }
        
        isLoadingData = true
        syncError = nil
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            DispatchQueue.main.async {
                isLoadingData = false
                if let error = error {
                    syncError = error.localizedDescription
                    return
                }
                
                guard let data = data else {
                    syncError = "No data received"
                    return
                }
                
                do {
                    let decoded = try JSONDecoder().decode(AdminDashboardData.self, from: data)
                    dashboardData = decoded
                } catch {
                    print("Decoding error: \(error)")
                    syncError = "Decoding failure: \(error.localizedDescription)"
                }
            }
        }.resume()
    }
    
    // --- Sub-Views for Dashboard Tabs ---
    
    @ViewBuilder
    func ordersTabView(data: AdminDashboardData) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Total Orders: \(data.orders.count)")
                .font(.system(.subheadline, design: .serif))
                .fontWeight(.bold)
                .foregroundColor(.secondary)
            
            if data.orders.isEmpty {
                Text("No orders placed yet.")
                    .font(.system(.body, design: .serif))
                    .foregroundColor(.gray)
                    .padding()
            } else {
                ForEach(data.orders) { order in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("ID: #\(String(order.id.prefix(8)).uppercased())")
                                .font(.system(.headline, design: .serif))
                                .fontWeight(.bold)
                                .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                            Spacer()
                            Text(order.status)
                                .font(.system(size: 11, weight: .bold, design: .serif))
                                .foregroundColor(order.status == "NEW" ? .blue : (order.status == "DELIVERED" ? .green : .orange))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color(white: 0.92))
                                .cornerRadius(4)
                        }
                        
                        Text("Customer: \(order.customerName)")
                            .font(.system(size: 14, weight: .semibold, design: .serif))
                        Text("Phone: \(order.phone)")
                            .font(.system(size: 12, design: .serif))
                            .foregroundColor(.gray)
                        Text("Address: \(order.address), \(order.city), \(order.pincode)")
                            .font(.system(size: 12, design: .serif))
                            .foregroundColor(.gray)
                        
                        if order.isGiftOrder {
                            Text("🎁 Gift Wrap: \(order.giftPackaging ?? "Default")")
                                .font(.system(size: 12, weight: .bold, design: .serif))
                                .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                            
                            if let msg = order.giftMessage, !msg.isEmpty {
                                Text("✉️ Msg: \"\(msg)\"")
                                    .font(.system(size: 11, design: .serif))
                                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                            }
                        }
                        
                        if let notes = order.notes, !notes.isEmpty {
                            Text("📝 Notes: \(notes)")
                                .font(.system(size: 12, design: .serif))
                                .foregroundColor(Color(white: 0.2))
                        }
                        
                        Divider().padding(.vertical, 4)
                        
                        Text("Items:")
                            .font(.system(size: 12, weight: .bold, design: .serif))
                        
                        ForEach(order.items) { item in
                            Text("• \(item.product.name) × \(item.quantity) (₹\(Int(item.price)))")
                                .font(.system(size: 12, design: .serif))
                                .foregroundColor(.gray)
                        }
                        
                        HStack {
                            Text("Total Amount:")
                                .font(.system(size: 13, design: .serif))
                            Spacer()
                            Text("₹\(Int(order.totalAmount))")
                                .font(.system(size: 14, weight: .bold, design: .serif))
                                .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                        }
                        .padding(.top, 4)
                        
                        if let photoUrl = order.dispatchPhotoUrl, !photoUrl.isEmpty {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("📸 Dispatch Photo Attached")
                                    .font(.system(size: 11, weight: .bold, design: .serif))
                                    .foregroundColor(.green)
                                
                                if let url = URL(string: photoUrl.hasPrefix("/") ? "\(networkManager.apiBaseUrl)\(photoUrl)" : photoUrl) {
                                    AsyncImage(url: url) { image in
                                        image.resizable().aspectRatio(contentMode: .fill)
                                    } placeholder: {
                                        Color(white: 0.92).overlay(ProgressView())
                                    }
                                    .frame(height: 120)
                                    .cornerRadius(6)
                                    .clipped()
                                }
                            }
                            .padding(.top, 6)
                        }
                        
                        Divider().padding(.vertical, 4)
                        
                        Text("Update Status:")
                            .font(.system(size: 11, design: .serif))
                            .foregroundColor(.gray)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 6) {
                                ForEach(["NEW", "CONFIRMED", "PACKED", "DISPATCHED", "DELIVERED"], id: \.self) { statusOption in
                                    Button(action: { updateStatus(orderId: order.id, status: statusOption) }) {
                                        Text(statusOption)
                                            .font(.system(size: 10, weight: order.status == statusOption ? .bold : .medium, design: .sansSerif))
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 4)
                                            .foregroundColor(order.status == statusOption ? .white : .black)
                                            .background(order.status == statusOption ? Color(red: 154/255, green: 44/255, blue: 44/255) : Color(white: 0.9))
                                            .cornerRadius(4)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                        }
                        
                        if order.status == "DISPATCHED" || order.status == "DELIVERED" {
                            HStack {
                                if isUploadingPhoto && uploadingOrderId == order.id {
                                    ProgressView("Uploading photo...")
                                } else {
                                    PhotosPicker(selection: $selectedPhotoItem, matching: .images, photoLibrary: .shared()) {
                                        HStack {
                                            Image(systemName: "camera.fill")
                                            Text("Upload Dispatch Photo")
                                        }
                                        .font(.system(size: 12, weight: .bold, design: .serif))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 8)
                                        .background(Color(white: 0.2))
                                        .cornerRadius(6)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                    .simultaneousGesture(TapGesture().perform {
                                        uploadingOrderId = order.id
                                    })
                                }
                            }
                            .padding(.top, 6)
                        }
                    }
                    .padding(14)
                    .background(Color.white)
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(white: 0.9), lineWidth: 1)
                    )
                }
            }
        }
    }
    
    @ViewBuilder
    func productsTabView(data: AdminDashboardData) -> some View {
        VStack(spacing: 12) {
            Button(action: {
                editingProduct = nil
                prodName = ""
                prodDesc = ""
                prodPrice = ""
                prodImgUrl = ""
                prodCategory = "Pickle"
                prodStockStatus = "IN_STOCK"
                prodStockCount = "10"
                prodSpiciness = 2
                showProductSheet = true
            }) {
                Text("➕ Add New Product")
                    .font(.system(.body, design: .serif))
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .cornerRadius(8)
            }
            .buttonStyle(PlainButtonStyle())
            
            if data.products.isEmpty {
                Text("No products in menu.")
                    .font(.system(.body, design: .serif))
                    .foregroundColor(.gray)
                    .padding()
            } else {
                ForEach(data.products) { product in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(product.name)
                            .font(.system(.headline, design: .serif))
                            .fontWeight(.bold)
                        Text("Price: ₹\(Int(product.price)) | Stock: \(product.stockCount) (\(product.stockStatus))")
                            .font(.system(size: 12, design: .serif))
                            .foregroundColor(.gray)
                        
                        HStack(spacing: 12) {
                            Button(action: {
                                editingProduct = product
                                prodName = product.name
                                prodDesc = product.description
                                prodPrice = "\(Int(product.price))"
                                prodImgUrl = product.imageUrl ?? ""
                                prodCategory = product.category
                                prodStockStatus = product.stockStatus
                                prodStockCount = "\(product.stockCount)"
                                prodSpiciness = product.spiciness
                                showProductSheet = true
                            }) {
                                Text("Edit")
                                    .font(.system(size: 12, weight: .bold, design: .serif))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 6)
                                    .background(Color(white: 0.3))
                                    .cornerRadius(4)
                            }
                            .buttonStyle(PlainButtonStyle())
                            
                            Button(action: { deleteProduct(productId: product.id) }) {
                                Text("Delete")
                                    .font(.system(size: 12, weight: .bold, design: .serif))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 6)
                                    .background(Color(red: 154/255, green: 44/255, blue: 44/255))
                                    .cornerRadius(4)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(12)
                    .background(Color.white)
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(white: 0.9), lineWidth: 1)
                    )
                }
            }
        }
    }
    
    @ViewBuilder
    func otherTabView(data: AdminDashboardData) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Subscriptions Section
            VStack(alignment: .leading, spacing: 8) {
                Text("Subscriptions (Achar Club):")
                    .font(.system(.headline, design: .serif))
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                
                if data.subscriptions.isEmpty {
                    Text("No subscriptions yet.")
                        .font(.system(size: 12, design: .serif))
                        .foregroundColor(.gray)
                } else {
                    ForEach(data.subscriptions) { sub in
                        Text("• \(sub.customerName) (\(sub.email ?? "no email")) - \(sub.isActive ? "Active ✅" : "Inactive")")
                            .font(.system(size: 12, design: .serif))
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .cornerRadius(8)
            
            // Passports Section
            VStack(alignment: .leading, spacing: 8) {
                Text("Pickle Passports (Completed):")
                    .font(.system(.headline, design: .serif))
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                
                if data.passports.isEmpty {
                    Text("No passports created.")
                        .font(.system(size: 12, design: .serif))
                        .foregroundColor(.gray)
                } else {
                    ForEach(data.passports) { passport in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(passport.customerName)
                                    .font(.system(size: 12, weight: .bold, design: .serif))
                                Text("Phone: \(passport.phone)")
                                    .font(.system(size: 11, design: .serif))
                                    .foregroundColor(.gray)
                                Text("Status: \(passport.isComplete ? "Complete ✅" : "In Progress") | Claimed: \(passport.freeJarClaimed ? "Yes 🎁" : "No")")
                                    .font(.system(size: 10, design: .serif))
                                    .foregroundColor(.gray)
                            }
                            Spacer()
                            if passport.isComplete && !passport.freeJarClaimed {
                                Button("Claim Jar") {
                                    claimPassportGift(phone: passport.phone)
                                }
                                .font(.system(size: 10, weight: .bold, design: .serif))
                                .foregroundColor(.white)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color.green)
                                .cornerRadius(4)
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(.vertical, 4)
                        Divider()
                    }
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .cornerRadius(8)
            
            // Jar Returns Section
            VStack(alignment: .leading, spacing: 8) {
                Text("Jar Returns Pickup Logs:")
                    .font(.system(.headline, design: .serif))
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                
                if data.jarReturns.isEmpty {
                    Text("No jar return logs.")
                        .font(.system(size: 12, design: .serif))
                        .foregroundColor(.gray)
                } else {
                    ForEach(data.jarReturns) { ret in
                        Text("• \(ret.customerName) (Jars: \(ret.jarCount)) - Credit Applied: \(ret.discountApplied ? "Yes ✅" : "No")")
                            .font(.system(size: 12, design: .serif))
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .cornerRadius(8)
            
            // Referrals Section
            VStack(alignment: .leading, spacing: 8) {
                Text("Referral Codes Usage:")
                    .font(.system(.headline, design: .serif))
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 154/255, green: 44/255, blue: 44/255))
                
                if data.referrals.isEmpty {
                    Text("No referrals created.")
                        .font(.system(size: 12, design: .serif))
                        .foregroundColor(.gray)
                } else {
                    ForEach(data.referrals) { ref in
                        Text("• Code: \(ref.referralCode) | Referrer: \(ref.referrerName) | Used: \(ref.isUsed ? "Yes" : "No")")
                            .font(.system(size: 12, design: .serif))
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .cornerRadius(8)
        }
    }
    
    // --- Product Dialog/Upsert Sheet ---
    
    @ViewBuilder
    func productUpsertSheet() -> some View {
        NavigationView {
            Form {
                Section(header: Text("Details")) {
                    TextField("Product Name", text: $prodName)
                    TextField("Description", text: $prodDesc)
                    TextField("Price (₹)", text: $prodPrice)
                        .keyboardType(.numberPad)
                    TextField("Image path (relative or absolute)", text: $prodImgUrl)
                    TextField("Category", text: $prodCategory)
                }
                
                Section(header: Text("Inventory & Attributes")) {
                    Picker("Stock Status", selection: $prodStockStatus) {
                        Text("IN_STOCK").tag("IN_STOCK")
                        Text("OUT_OF_STOCK").tag("OUT_OF_STOCK")
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    TextField("Stock Count", text: $prodStockCount)
                        .keyboardType(.numberPad)
                    
                    Stepper("Spiciness Level: \(prodSpiciness)", value: $prodSpiciness, in: 0...3)
                }
            }
            .navigationTitle(editingProduct == nil ? "Add New Product" : "Edit Product")
            .navigationBarItems(
                leading: Button("Cancel") { showProductSheet = false },
                trailing: Button("Save") { saveProduct() }
            )
        }
    }
    
    // --- Helper Functions to Update Dashboard State ---
    
    func updateStatus(orderId: String, status: String) {
        guard let url = URL(string: "\(networkManager.apiBaseUrl)/api/admin/orders/\(orderId)") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["status": status]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])
        
        isLoadingData = true
        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                fetchDashboardData()
            }
        }.resume()
    }
    
    func uploadPhoto(orderId: String, data: Data) {
        isUploadingPhoto = true
        
        guard let url = URL(string: "\(networkManager.apiBaseUrl)/api/admin/orders/\(orderId)/dispatch-photo") else {
            isUploadingPhoto = false
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        let lineEnd = "\r\n"
        let twoHyphens = "--"
        
        body.append(Data("\(twoHyphens)\(boundary)\(lineEnd)".utf8))
        body.append(Data("Content-Disposition: form-data; name=\"file\"; filename=\"photo.jpg\"\(lineEnd)".utf8))
        body.append(Data("Content-Type: image/jpeg\(lineEnd)\(lineEnd)".utf8))
        body.append(data)
        body.append(Data("\(lineEnd)".utf8))
        body.append(Data("\(twoHyphens)\(boundary)\(twoHyphens)\(lineEnd)".utf8))
        
        request.httpBody = body
        
        URLSession.shared.dataTask(with: request) { _, response, error in
            DispatchQueue.main.async {
                isUploadingPhoto = false
                if let error = error {
                    print("Error uploading photo: \(error)")
                }
                fetchDashboardData()
            }
        }.resume()
    }
    
    func saveProduct() {
        guard let priceVal = Double(prodPrice) else { return }
        let stockVal = Int(prodStockCount) ?? 10
        
        let prodId = editingProduct?.id
        let endpoint = prodId == nil ? "/api/admin/products" : "/api/admin/products/\(prodId!)"
        guard let url = URL(string: "\(networkManager.apiBaseUrl)\(endpoint)") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = prodId == nil ? "POST" : "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        var bodyJson: [String: Any] = [
            "name": prodName,
            "description": prodDesc,
            "price": priceVal,
            "imageUrl": prodImgUrl,
            "category": prodCategory,
            "stockStatus": prodStockStatus,
            "stockCount": stockVal,
            "spiciness": prodSpiciness
        ]
        
        if prodId != nil {
            bodyJson["id"] = prodId!
        }
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: bodyJson, options: [])
        
        isLoadingData = true
        showProductSheet = false
        
        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                fetchDashboardData()
                networkManager.fetchProducts() // reload general menu
            }
        }.resume()
    }
    
    func deleteProduct(productId: String) {
        guard let url = URL(string: "\(networkManager.apiBaseUrl)/api/admin/products/\(productId)") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        isLoadingData = true
        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                fetchDashboardData()
                networkManager.fetchProducts() // reload general menu
            }
        }.resume()
    }
    
    func claimPassportGift(phone: String) {
        guard let url = URL(string: "\(networkManager.apiBaseUrl)/api/admin/claim-passport") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["phone": phone]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])
        
        isLoadingData = true
        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                fetchDashboardData()
            }
        }.resume()
    }
}
