import { ContactRequest, validateContactRequestBody } from '../src/validate'

describe('Validate Contact Request Body', () => {
  test('No From returns an Error', async () => {
    const contactRequest = {
      subject: 'Test',
      message: 'Test',
    }

    const isValid = validateContactRequestBody(contactRequest as ContactRequest);
    expect(isValid.status).toEqual(false);
    expect(isValid.msg).toContain('Missing');
  })
})
