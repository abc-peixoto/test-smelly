const { UserService } = require('../src/userService');

const usuarioPadrao = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService - suite de testes limpa', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('cria um usuario valido com status ativo', () => {
    const usuarioCriado = userService.createUser(
      usuarioPadrao.nome,
      usuarioPadrao.email,
      usuarioPadrao.idade
    );

    expect(usuarioCriado).toMatchObject({
      nome: usuarioPadrao.nome,
      email: usuarioPadrao.email,
      idade: usuarioPadrao.idade,
      isAdmin: false,
      status: 'ativo',
    });
    expect(usuarioCriado.id).toEqual(expect.any(String));
    expect(usuarioCriado.createdAt).toBeInstanceOf(Date);
  });

  test('busca um usuario cadastrado pelo ID', () => {
    const usuarioCriado = userService.createUser(
      usuarioPadrao.nome,
      usuarioPadrao.email,
      usuarioPadrao.idade
    );

    const usuarioBuscado = userService.getUserById(usuarioCriado.id);

    expect(usuarioBuscado).toEqual(usuarioCriado);
  });

  test('retorna null ao buscar um usuario inexistente', () => {
    const usuarioBuscado = userService.getUserById('id-inexistente');

    expect(usuarioBuscado).toBeNull();
  });

  test('nao cria usuario menor de idade', () => {
    const criarUsuarioMenor = () => {
      userService.createUser('Menor', 'menor@email.com', 17);
    };

    expect(criarUsuarioMenor).toThrow(/maior de idade/);
  });

  test('desativa um usuario comum', () => {
    const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

    const foiDesativado = userService.deactivateUser(usuarioComum.id);

    expect(foiDesativado).toBe(true);
    expect(userService.getUserById(usuarioComum.id)).toMatchObject({
      status: 'inativo',
    });
  });

  test('nao desativa um usuario administrador', () => {
    const usuarioAdmin = userService.createUser(
      'Admin',
      'admin@teste.com',
      40,
      true
    );

    const foiDesativado = userService.deactivateUser(usuarioAdmin.id);

    expect(foiDesativado).toBe(false);
    expect(userService.getUserById(usuarioAdmin.id)).toMatchObject({
      isAdmin: true,
      status: 'ativo',
    });
  });

  test('retorna false ao tentar desativar usuario inexistente', () => {
    const foiDesativado = userService.deactivateUser('id-inexistente');

    expect(foiDesativado).toBe(false);
  });

  test('gera relatorio informando quando nao ha usuarios cadastrados', () => {
    const relatorio = userService.generateUserReport();

    expect(relatorio).toMatch(/Nenhum usu.rio cadastrado/);
  });

  test('gera relatorio com os usuarios cadastrados e seus status', () => {
    const alice = userService.createUser('Alice', 'alice@email.com', 28);
    const bob = userService.createUser('Bob', 'bob@email.com', 32);
    userService.deactivateUser(bob.id);

    const relatorio = userService.generateUserReport();

    expect(relatorio).toMatch(/Relat.rio de Usu.rios/);
    expect(relatorio).toContain(`Nome: ${alice.nome}`);
    expect(relatorio).toContain(`Nome: ${bob.nome}`);
    expect(relatorio).toContain('Status: ativo');
    expect(relatorio).toContain('Status: inativo');
  });
});
