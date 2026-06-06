export default function Footer() {
  return (
    <footer className="footer-lux">
      {/* Infinite Scrolling Marquee */}
      <div className="marquee">
        <div className="marquee-track">
          <span>HOMEMADE IN JAIPUR • SUN-DRIED IN SMALL BATCHES • NO ARTIFICIAL PRESERVATIVES • PAN-INDIA SHIPPING • </span>
          <span>HOMEMADE IN JAIPUR • SUN-DRIED IN SMALL BATCHES • NO ARTIFICIAL PRESERVATIVES • PAN-INDIA SHIPPING • </span>
        </div>
      </div>

      <div className="container">
        <div className="footer-content-lux">
          <div className="footer-brand-section">
            <h3 className="footer-logo-lux">RS SAVOURY</h3>
            <p className="footer-desc-lux">
              Bringing Jaipur's authentic, hand-ground, and sun-matured pickles straight to your dining table. Made with pure mustard oil and generational recipes.
            </p>
          </div>
          
          <div className="footer-links-section">
            <h4 className="footer-heading-lux">Explore</h4>
            <ul className="footer-links-list">
              <li><a href="/">Home</a></li>
              <li><a href="/products">Shop All Pickles</a></li>
              <li><a href="/cart">Your Shopping Cart</a></li>
            </ul>
          </div>
          
          <div className="footer-links-section">
            <h4 className="footer-heading-lux">Community</h4>
            <ul className="footer-links-list">
              <li><a href="/diary">Aunty's Diary</a></li>
              <li><a href="/quiz">Find Your Pickle</a></li>
              <li><a href="/subscribe">Achar Club</a></li>
              <li><a href="/passport">Pickle Passport</a></li>
              <li><a href="/jar-return">Return Empty Jars</a></li>
              <li><a href="/gift-builder">Build a Gift Box</a></li>
            </ul>
          </div>
          
          <div className="footer-contact-section">
            <h4 className="footer-heading-lux">Contact</h4>
            <p className="footer-contact-item">110, Krishna Nagar, Teen Dukan, Dher Ke Balaji, Vidyadhar Nagar, Jaipur, Rajasthan 302039</p>
            <p className="footer-contact-item">Phone: +91 63505 92597, +91 63778 78454</p>
            <p className="footer-contact-item">Email: hello@rssavoury.com</p>
          </div>
        </div>
        
        <div className="footer-bottom-lux">
          <p>&copy; {new Date().getFullYear()} RS Savoury. Handcrafted with love.</p>
          <p className="footer-disclaimer">Artisanal e-commerce MVP concept.</p>
        </div>
      </div>
    </footer>
  );
}

