import { ChatHistoryMessage, GeminiContent } from './interfaces/chat.interface';
import { FashionProduct } from './data/fashion-products.data';

const ROLE_MAPPING = {
  user: 'user',
  assistant: 'model',
} as const;

export function buildFashionAdvisorInstruction(products: FashionProduct[]): string {
  const intro = [
    'Bạn là nhân viên tư vấn bán hàng của cửa hàng thời trang Glory Boutique.',
    'Hãy tự giới thiệu là nhân viên cửa hàng và giao tiếp như một stylist chuyên nghiệp luôn đồng hành cùng khách.',
    'Nhiệm vụ của bạn là gợi ý trang phục, phụ kiện và cách phối đồ dựa trên sở thích, dáng người, hoàn cảnh sử dụng của khách hàng.',
    'Luôn tư vấn bằng tiếng Việt tự nhiên, nhiệt tình và tạo cảm giác được chăm sóc tận tâm như tại showroom.',
  ].join(' ');

  const catalog = products
    .map((product, index) => {
      const lines = [
        `${index + 1}. ${product.name} [${product.category}] - giá: ${product.priceRange}.`,
        `   - Mô tả: ${product.description}`,
        `   - Màu sắc: ${product.colors.join(', ')}`,
        `   - Size: ${product.sizes.join(', ')}`,
        `   - Chất liệu: ${product.materials.join(', ')}`,
        `   - Dịp phù hợp: ${product.occasions.join(', ')}`,
        `   - Điểm nổi bật: ${product.highlights.join('; ')}`,
        `   - Tồn kho: ${product.inventoryStatus}`,
      ];
      return lines.join('\n');
    })
    .join('\n');

  const guidance = [
    'Nguyên tắc tư vấn:',
    '1. Bắt đầu mỗi phản hồi bằng lời chào thân thiện và nhắc bạn là nhân viên Glory Boutique sẵn sàng hỗ trợ.',
    '2. Luôn xác nhận lại thông tin khách cung cấp và đề xuất thêm câu hỏi để hiểu rõ nhu cầu.',
    '3. Đưa ra tối đa 3 gợi ý phù hợp cùng lý do rõ ràng (phù hợp màu da, dáng người, hoàn cảnh...).',
    '4. Có thể gợi ý phối hợp nhiều sản phẩm trong danh mục để tạo outfit hoàn chỉnh.',
    '5. Nếu sản phẩm khách yêu cầu hết hàng, đề xuất phương án thay thế với ưu điểm tương tự.',
    '6. Luôn nhắc khách kiểm tra size và chính sách đổi trả của cửa hàng.',
    '7. Giọng điệu: dùng đại từ "mình" khi xưng, gọi khách là "bạn", giữ thái độ nhiệt tình, chân thành như đang tư vấn trực tiếp tại cửa hàng.',
  ].join('\n');

  return `${intro}\n\nDanh mục sản phẩm hiện có:\n${catalog}\n\n${guidance}`;
}

export function buildGeminiContents(
  message: string,
  history: ChatHistoryMessage[] = [],
): GeminiContent[] {
  const contents: GeminiContent[] = [];

  for (const item of history) {
    if (!item || typeof item.content !== 'string') {
      continue;
    }

    const cleaned = item.content.trim();
    if (!cleaned) {
      continue;
    }

    const mappedRole = ROLE_MAPPING[item.role];
    if (!mappedRole) {
      continue;
    }

    contents.push({
      role: mappedRole,
      parts: [{ text: cleaned }],
    });
  }

  const latest = message.trim();
  if (!latest) {
    throw new Error('Message must not be empty');
  }

  contents.push({
    role: 'user',
    parts: [{ text: latest }],
  });

  return contents;
}
