import crypto from 'crypto';


export const generateToken = () => {
	try {
		const token = crypto.randomBytes(20).toString('hex');
		return token;
	} catch (error) {
		console.error('Error in generateVerificationToken:', error);
		throw error;
	}
};

export const generateReferenceId = async () => {
	const { customAlphabet } = await import('nanoid');
	const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);
	const id = nanoid();

	return id;
};

export const generatePromoCode = async () => {
	const { customAlphabet } = await import('nanoid');
	const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
	const id = nanoid();

	return id;
};

export const generatePassword = async () => {
	const { customAlphabet } = await import('nanoid');
	const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&*()', 10);
	const id = nanoid();

	return id;
};
