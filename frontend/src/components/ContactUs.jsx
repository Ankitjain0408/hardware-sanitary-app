import { FaTimes } from "react-icons/fa";

function ContactUs({ onClose }) {
  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Contact Us
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 transition p-2 hover:bg-gray-100 rounded-full"
            >
              <FaTimes className="text-2xl" />
            </button>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8 md:p-12 shadow-lg">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Shop Owner:</h2>
              <div className="text-gray-600 space-y-1">
                <p><span className="font-semibold text-gray-900">Mr Varun Agrawal</span></p>
                <p><span className="font-semibold text-gray-900">Mr Sahil Agrawal</span></p>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Phone:</h2>
              <div className="space-y-2">
                <a 
                  href="tel:+917008850475" 
                  className="block text-slate-700 hover:text-slate-900 transition text-lg"
                >
                  Mr Varun Agrawal: +91 7008850475
                </a>
                <a 
                  href="tel:+919938222004" 
                  className="block text-slate-700 hover:text-slate-900 transition text-lg"
                >
                  Mr Sahil Agrawal: +91 9938222004
                </a>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Email:</h2>
              <a 
                href="mailto:sahil.agr250@gmail.com" 
                className="text-slate-700 hover:text-slate-900 transition text-lg"
              >
                sahil.agr250@gmail.com
              </a>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-base mb-4">
                Please call between <span className="font-semibold text-gray-900">10:00 AM – 8:00 PM</span> on working days.
              </p>
            </div>
            
            <div className="pt-4">
              <p className="text-gray-600 text-base mb-4">
                You can also contact us via WhatsApp.
              </p>
              <a
                href="https://wa.me/917008850475"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contact via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;

