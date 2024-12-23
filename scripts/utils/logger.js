export const logger = {
  info: (...args) => console.log('📝', ...args),
  success: (...args) => console.log('✅', ...args),
  error: (...args) => console.error('❌', ...args),
  warn: (...args) => console.warn('⚠️', ...args)
};