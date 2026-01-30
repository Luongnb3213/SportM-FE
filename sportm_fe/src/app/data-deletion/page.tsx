import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Deletion Request | Yêu cầu Xóa Dữ liệu - SportM',
  description: 'Request deletion of your personal data from SportM app - Yêu cầu xóa dữ liệu cá nhân khỏi ứng dụng SportM',
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-8 py-12 text-center text-white">
            <h1 className="text-4xl font-bold mb-3">🏃 SportM</h1>
            <p className="text-lg opacity-95">
              User Data Deletion Request | Yêu cầu Xóa Dữ liệu Người dùng
            </p>
          </div>

          <div className="px-8 py-12">
            {/* Vietnamese Section */}
            <section className="mb-16">
              <div className="inline-block bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6">
                🇻🇳 Tiếng Việt
              </div>

              <h2 className="text-3xl font-bold text-purple-600 mb-6">
                Yêu cầu Xóa Dữ liệu Cá nhân
              </h2>

              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Chúng tôi tôn trọng quyền riêng tư của bạn. Nếu bạn đã đăng nhập vào ứng dụng SportM
                bằng tài khoản Facebook và muốn xóa dữ liệu cá nhân của mình, vui lòng làm theo
                hướng dẫn dưới đây.
              </p>

              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                📋 Dữ liệu chúng tôi thu thập từ Facebook
              </h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg mb-6">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Tên hiển thị</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Ảnh đại diện</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Facebook User ID</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                🗑️ Cách yêu cầu xóa dữ liệu
              </h3>
              <div className="bg-gray-50 border-l-4 border-purple-500 p-6 rounded-r-lg mb-6">
                <ol className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-bold mr-3 text-purple-600">1.</span>
                    <span>
                      Gửi email đến:{' '}
                      <a
                        href="mailto:ly3063414@gmail.com"
                        className="text-purple-600 font-semibold hover:underline"
                      >
                        ly3063414@gmail.com
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-3 text-purple-600">2.</span>
                    <span>
                      Tiêu đề email: <span className="font-semibold">&quot;Yêu cầu xóa dữ liệu - SportM&quot;</span>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-3 text-purple-600">3.</span>
                    <div>
                      <p className="mb-2">Nội dung email cần bao gồm:</p>
                      <ul className="ml-6 space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Facebook User ID của bạn (nếu biết)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Email bạn đã sử dụng để đăng ký</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Lý do muốn xóa dữ liệu (tùy chọn)</span>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ol>
              </div>

              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                ⏱️ Thời gian xử lý
              </h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-6">
                <p className="text-gray-700">
                  ⚠️ Yêu cầu của bạn sẽ được xử lý trong vòng{' '}
                  <span className="font-bold text-indigo-700">7 ngày làm việc</span>. Bạn sẽ nhận được
                  email xác nhận sau khi dữ liệu đã được xóa hoàn toàn.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                ❗ Lưu ý quan trọng
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Sau khi dữ liệu được xóa, bạn sẽ không thể đăng nhập vào ứng dụng bằng tài khoản
                Facebook đã sử dụng trước đó. Hành động này{' '}
                <span className="font-bold text-red-600">không thể hoàn tác</span>.
              </p>
            </section>

            {/* Divider */}
            <div className="h-0.5 bg-gradient-to-r from-purple-600 to-indigo-700 opacity-20 my-12" />

            {/* English Section */}
            <section className="mb-12">
              <div className="inline-block bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6">
                🇬🇧 English
              </div>

              <h2 className="text-3xl font-bold text-purple-600 mb-6">
                User Data Deletion Request
              </h2>

              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                We respect your privacy. If you have logged into the SportM app using your Facebook
                account and wish to delete your personal data, please follow the instructions below.
              </p>

              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                📋 Data We Collect from Facebook
              </h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg mb-6">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Display name</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Email address</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Profile picture</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Facebook User ID</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                🗑️ How to Request Data Deletion
              </h3>
              <div className="bg-gray-50 border-l-4 border-purple-500 p-6 rounded-r-lg mb-6">
                <ol className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-bold mr-3 text-purple-600">1.</span>
                    <span>
                      Send an email to:{' '}
                      <a
                        href="mailto:ly3063414@gmail.com"
                        className="text-purple-600 font-semibold hover:underline"
                      >
                        ly3063414@gmail.com
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-3 text-purple-600">2.</span>
                    <span>
                      Email subject: <span className="font-semibold">&quot;Data Deletion Request - SportM&quot;</span>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-3 text-purple-600">3.</span>
                    <div>
                      <p className="mb-2">Email content should include:</p>
                      <ul className="ml-6 space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Your Facebook User ID (if known)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Email address you used to sign up</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Reason for deletion (optional)</span>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ol>
              </div>

              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                ⏱️ Processing Time
              </h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-6">
                <p className="text-gray-700">
                  ⚠️ Your request will be processed within{' '}
                  <span className="font-bold text-indigo-700">7 business days</span>. You will receive a
                  confirmation email once your data has been completely deleted.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                ❗ Important Notice
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                After your data is deleted, you will not be able to log into the app using the
                Facebook account you previously used. This action is{' '}
                <span className="font-bold text-red-600">irreversible</span>.
              </p>
            </section>

            {/* Contact Section */}
            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-purple-600 mb-4">
                📧 Contact Us
              </h3>
              <p className="text-gray-700 mb-4">
                For any questions or concerns, please contact:
              </p>
              <a
                href="mailto:ly3063414@gmail.com"
                className="text-purple-600 text-xl font-semibold hover:underline break-all"
              >
                ly3063414@gmail.com
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-8 py-6 text-center text-gray-600">
            <p className="mb-2">© 2026 SportM. All rights reserved.</p>
            <p className="text-sm">
              This page complies with Meta Platform Policy requirements for user data deletion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
