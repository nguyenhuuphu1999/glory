export interface FashionProduct {
  id: string;
  name: string;
  category: string;
  priceRange: string;
  description: string;
  colors: string[];
  sizes: string[];
  materials: string[];
  occasions: string[];
  highlights: string[];
  inventoryStatus: string;
}

export const FASHION_PRODUCTS: FashionProduct[] = [
  {
    id: 'D001',
    name: 'Đầm midi xếp ly Aurora',
    category: 'Đầm dự tiệc',
    priceRange: '1.690.000 - 1.890.000 VND',
    description:
      'Thiết kế cổ vuông tôn dáng với phần eo nhún và chân váy xếp ly bồng nhẹ, phù hợp cho tiệc tối và sự kiện trang trọng.',
    colors: ['Đỏ ruby', 'Xanh navy'],
    sizes: ['S', 'M', 'L'],
    materials: ['Lụa satin cao cấp', 'Lót polyester thoáng khí'],
    occasions: ['Tiệc tối', 'Sự kiện quan trọng', 'Hẹn hò'],
    highlights: [
      'Tạo hiệu ứng thon gọn vòng eo',
      'Chất liệu mềm mịn, ít nhăn',
      'Độ dài qua gối lịch sự',
    ],
    inventoryStatus: 'Còn đầy đủ size, màu đỏ ruby đang bán chạy',
  },
  {
    id: 'O014',
    name: 'Áo blazer dáng suông Emerald',
    category: 'Áo khoác',
    priceRange: '1.290.000 VND',
    description:
      'Blazer dáng suông hiện đại với chi tiết ve áo bản vừa và cúc kim loại. Dễ phối với quần âu, váy suông hoặc jeans.',
    colors: ['Xanh lục bảo', 'Kem'],
    sizes: ['XS', 'S', 'M', 'L'],
    materials: ['Twill pha len', 'Lót thun co giãn'],
    occasions: ['Đi làm', 'Gặp gỡ đối tác', 'Mix-and-match cuối tuần'],
    highlights: [
      'Form suông che khuyết điểm vai và tay',
      'Có túi ẩn tiện lợi',
      'Mix được phong cách smart-casual hoặc semi-formal',
    ],
    inventoryStatus: 'Size XS chỉ còn 2 chiếc, các size còn lại còn đủ',
  },
  {
    id: 'S022',
    name: 'Chân váy bút chì Velvet',
    category: 'Chân váy',
    priceRange: '890.000 VND',
    description:
      'Chân váy bút chì phối chất liệu nhung gân, có đường may chéo tạo hiệu ứng kéo dài chân.',
    colors: ['Đen than', 'Nâu chocolate'],
    sizes: ['S', 'M', 'L', 'XL'],
    materials: ['Nhung gân nhập khẩu', 'Thun co giãn 4 chiều'],
    occasions: ['Đi làm', 'Dạ tiệc nhẹ', 'Chụp hình lookbook'],
    highlights: [
      'Có lớp lót mỏng chống tĩnh điện',
      'Đường xẻ sau tiện di chuyển',
      'Đính nút trang trí kim loại cổ điển',
    ],
    inventoryStatus: 'Size XL mới về thêm hàng, các size khác bán ổn định',
  },
  {
    id: 'T031',
    name: 'Áo len cổ lọ Breeze',
    category: 'Áo len',
    priceRange: '720.000 VND',
    description:
      'Áo len cổ lọ ôm nhẹ, đan họa tiết gân nổi giúp giữ ấm nhưng vẫn thoáng. Dễ phối layer mùa thu đông.',
    colors: ['Be nhạt', 'Xám tro', 'Hồng phấn'],
    sizes: ['S', 'M', 'L'],
    materials: ['Len cotton pha cashmere'],
    occasions: ['Đi làm', 'Đi chơi cuối tuần', 'Du lịch Đà Lạt'],
    highlights: [
      'Co giãn 4 chiều, không gây ngứa',
      'Thiết kế tay dài bo nhẹ tạo sự thon gọn',
      'Có thể mặc riêng hoặc layer với blazer/áo khoác',
    ],
    inventoryStatus: 'Màu be bán chạy nhất, đang dự kiến nhập thêm cuối tuần',
  },
];
