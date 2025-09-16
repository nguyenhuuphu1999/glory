import { buildFashionAdvisorInstruction, buildGeminiContents } from './chat-prompt.util';
import { FASHION_PRODUCTS } from './data/fashion-products.data';

describe('chat prompt utils', () => {
  it('buildFashionAdvisorInstruction should include catalog details and store voice', () => {
    const prompt = buildFashionAdvisorInstruction(FASHION_PRODUCTS);

    expect(prompt).toContain('Danh mục sản phẩm hiện có');
    expect(prompt).toContain('nhân viên tư vấn bán hàng của cửa hàng thời trang Glory Boutique');
    expect(prompt).toContain('Bắt đầu mỗi phản hồi bằng lời chào thân thiện');
    expect(prompt).toContain('Giọng điệu: dùng đại từ "mình" khi xưng');
    for (const product of FASHION_PRODUCTS) {
      expect(prompt).toContain(product.name);
      expect(prompt).toContain(product.priceRange);
    }
  });

  it('buildGeminiContents should map history and include latest message', () => {
    const contents = buildGeminiContents('Mình cần tư vấn đầm dự tiệc', [
      { role: 'user', content: 'Xin chào shop' },
      { role: 'assistant', content: 'Chào bạn, mình có thể hỗ trợ gì?' },
    ]);

    expect(contents).toHaveLength(3);
    expect(contents[0]).toEqual({
      role: 'user',
      parts: [{ text: 'Xin chào shop' }],
    });
    expect(contents[1]).toEqual({
      role: 'model',
      parts: [{ text: 'Chào bạn, mình có thể hỗ trợ gì?' }],
    });
    expect(contents[2]).toEqual({
      role: 'user',
      parts: [{ text: 'Mình cần tư vấn đầm dự tiệc' }],
    });
  });

  it('buildGeminiContents should throw for empty message', () => {
    expect(() => buildGeminiContents('   ', [])).toThrow('Message must not be empty');
  });
});
