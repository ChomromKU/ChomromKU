describe('Authentication Test', () => {
  it('User failed to login with incorrect credentials', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[data-testid="username-input"]').should('exist').type('incorrect_username');
    cy.log('Typed incorrect username');
    cy.get('input[data-testid="password-input"]').should('exist').type('incorrect_password');
    cy.log('Typed incorrect password');
    cy.contains('เข้าสู่ระบบ').click();
    cy.log('Clicked on the login button');
    cy.get('p.text-red-400').should('exist').and('contain.text', 'บัญชีผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
  });

  it('Displays alert message when unauthenticated user clicks like button on postDetail page', () => {
    cy.visit('http://localhost:3000/posts/1');
    cy.get('svg').eq(0).click({ force: true });
    cy.on('window:alert', (alertMessage) => {
      expect(alertMessage).to.equal('กรุณาเข้าสู่ระบบ');
    });
  });

  it('Displays alert message when unauthenticated user commented on postDetail page', () => {
    cy.visit('http://localhost:3000/posts/1');
    cy.get('input[placeholder="แสดงความคิดเห็น"]').type('Cypress test comment');
    cy.get('svg').eq(2).click({ force: true });
    cy.on('window:alert', (alertMessage) => {
      expect(alertMessage).to.equal('กรุณาเข้าสู่ระบบ');
    });
  });

  it('Displays alert message when unauthenticated user clicks like button on eventDetail page', () => {
    cy.visit('http://localhost:3000/events/1');
    cy.get('svg').eq(0).click({ force: true });
    cy.on('window:alert', (alertMessage) => {
      expect(alertMessage).to.equal('กรุณาเข้าสู่ระบบ');
    });
  });

  it('Displays alert message when unauthenticated user commented on eventDetail page', () => {
    cy.visit('http://localhost:3000/events/1');
    cy.get('input[placeholder="แสดงความคิดเห็น"]').type('Cypress test comment');
    cy.get('svg').eq(2).click({ force: true });
    cy.on('window:alert', (alertMessage) => {
      expect(alertMessage).to.equal('กรุณาเข้าสู่ระบบ');
    });
  });

  it('Displays alert message when unauthenticated user click followClub button', () => {
    cy.visit('http://localhost:3000/clubs/1');
    cy.contains('ติดตาม').click();
    cy.on('window:alert', (alertMessage) => {
      expect(alertMessage).to.equal('กรุณาเข้าสู่ระบบ');
    });
  });

  it('Redirects to login page when unauthenticated user clicks follow club button', () => {
    cy.visit('http://localhost:3000/clubs/1');
    cy.contains('เข้าสู่ระบบเพื่อสมัครเข้าชมรม').click();
    cy.url().should('include', '/login');
  });

  it('Redirects to create post page when unauthenticated user clicks create post button, and show login message', () => {
    cy.visit('http://localhost:3000/clubs/1');
    cy.get('[data-testid="create-post-button"]').click();
    cy.url().should('include', '/clubs/1/posts/new');
    cy.get('div').contains('เข้าสู่ระบบเพื่อสร้างโพสต์').should('exist');
    cy
  });
});
