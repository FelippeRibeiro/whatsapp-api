export function validNumber(number: string): string {
  if (number.length > 13) throw new Error('Numero invalido');
  if (number.length < 10) throw new Error('Numero invalido');

  const numberWithOutCountryCode = number.substring(0, 2) == '55' ? number.substring(2) : number;

  const ddd = numberWithOutCountryCode.substring(0, 2);
  const keep9 = !!ddds.find((data) => data.ddd === ddd);

  const has9 = numberWithOutCountryCode.substring(2).length == 9 && numberWithOutCountryCode.substring(2)[0] == '9';

  const numberWithOutDDD = numberWithOutCountryCode.substring(2);

  if ((has9 && keep9) || (!has9 && !keep9)) return '55' + numberWithOutCountryCode;
  if (!keep9 && has9) return `55${ddd}${numberWithOutDDD.substring(1)}`;
  if (keep9 && !has9) return `55${ddd}9${numberWithOutDDD}`;
  return number;
}
//DDDs que mantém o digito 9
const ddds = [
  {
    cidade: 'São Paulo',
    ddd: '11',
  },
  {
    cidade: 'São Paulo',
    ddd: '12',
  },
  {
    cidade: 'São Paulo',
    ddd: '13',
  },
  {
    cidade: 'São Paulo',
    ddd: '14',
  },
  {
    cidade: 'São Paulo',
    ddd: '15',
  },
  {
    cidade: 'São Paulo',
    ddd: '16',
  },
  {
    cidade: 'São Paulo',
    ddd: '17',
  },
  {
    cidade: 'São Paulo',
    ddd: '18',
  },
  {
    cidade: 'São Paulo',
    ddd: '19',
  },
  {
    cidade: 'Rio de Janeiro',
    ddd: '21',
  },
  {
    cidade: 'Rio de Janeiro',
    ddd: '22',
  },
  {
    cidade: 'Rio de Janeiro',
    ddd: '24',
  },
  {
    cidade: 'Espírito Santo',
    ddd: '27',
  },
  {
    cidade: 'Espírito Santo',
    ddd: '28',
  },
];
