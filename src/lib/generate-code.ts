const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function generateCode(length: number) {
  let code = '';
  const charactersLength = characters.length;

  while (code.length < length) {
    code += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return code;
}
