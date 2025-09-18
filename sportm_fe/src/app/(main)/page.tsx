import FeatureSection from "@/components/ui/home/feature-section";
import Hero from "@/components/ui/home/hero";

export default function Home() {
  return (
    <>
      <Hero />

      <FeatureSection
        index={1}
        title="Xem Tình Trạng Sân"
        description={`Giúp chủ sân xem được sân nào giờ nào còn trống hay đã được đặt.
Chủ sân có thể xem được đơn nào chưa thanh toán, đã thanh toán hay còn đang sử dụng dịch vụ ở sân.
Ngoài ra có thể xem được khách nào là khách lẻ, khách nào cố định.`}
        image={{ src: "/images/tennis-1.png", alt: "Tennis court" }}
        cta={{ href: "#", label: "xem thêm" }}
        bg="/images/background-image.png"
      />

      <FeatureSection
        index={2}
        title={
          <>
            Thống Kê Doanh Thu
          </>
        }
        description={`Tính năng bán hàng của phần mềm quản lý SportM cho phép chủ sân dễ dàng bán các dịch vụ như nước uống, vợt, bóng, cầu, đồ ăn… một cách nhanh chóng và hiệu quả.
Giúp theo dõi doanh thu từ việc bán dịch vụ.`}
        image={{ src: "/images/tennis-1.png", alt: "Tennis court" }}
        cta={{ href: "#", label: "xem thêm" }}
        bg="/images/background-image.png"
        reverse
      />

      <FeatureSection
        index={3}
        title="Quản Lý Lịch Đặt"
        description={`SportM cung cấp đầy đủ tính năng quản lý và tạo lịch đặt theo ngày, linh hoạt, cố định theo tháng.
Đồng thời bạn có thể theo dõi và duyệt đơn đặt lịch từ khách hàng, giúp bạn tổ chức công việc một cách thuận tiện và dễ dàng.`}
        image={{ src: "/images/tennis-1.png", alt: "Tennis court" }}
        cta={{ href: "#", label: "xem thêm" }}
        bg="/images/background-image.png"
      />

      <FeatureSection
        index={4}
        title="Quảng Cáo Đa Nền Tảng"
        description={`Tính năng bán hàng của phần mềm quản lý SportM cho phép chủ sân dễ dàng bán các dịch vụ như nước uống, vợt, bóng, cầu, đồ ăn… một cách nhanh chóng và hiệu quả.
Giúp theo dõi doanh thu từ việc bán dịch vụ.`}
        image={{ src: "/images/tennis-1.png", alt: "Tennis court" }}
        cta={{ href: "#", label: "xem thêm" }}
        bg="/images/background-image.png"
        reverse
      />
    </>
  );
}
