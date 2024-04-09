describe('Default elements Test', () => {
  it('Home page renders the default elements on the screen', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-testid="navbar"]').should('exist').should('contain.text', 'ชมรมทั้งหมด');
    cy.get('[data-testid="nav-logo"]').should('exist');
    cy.get('input').should('exist').should('have.attr', 'placeholder', 'ค้นหาอีเว้นท์');
    cy.get('[data-testid="calendar"]').should('exist').should('contain.text', 'ตารางอีเว้นท์และกิจกรรม');
    cy.get('[data-testid="posts"]').should('exist').should('contain.text', 'โพสต์');
  });

  it('Clubs page renders the default elements on the screen', () => {
    cy.visit('http://localhost:3000/clubs');
    cy.get('[data-testid="clubs"]').should('exist').should('contain.text', 'ชมรมทั้งหมด');
    cy.get('input').should('exist').should('have.attr', 'placeholder', 'ค้นหาชมรม');
    cy.get('[data-testid="bangkhen-branch"]').should('exist').should('contain.text', 'วิทยาเขตบางเขน');
    cy.get('[data-testid="kamphaengsaen-branch"]').should('exist').should('contain.text', 'วิทยาเขตกำแพงแสน');
    cy.get('[data-testid="sakonnakorn-branch"]').should('exist').should('contain.text', 'วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร');
    cy.get('[data-testid="sriracha-branch"]').should('exist').should('contain.text', 'วิทยาเขตศรีราชา');
  });

  it('Login page renders the default elements on the screen', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="logo"]').should('exist')
    cy.get('[data-testid="username-text"]').should('exist').should('contain.text', 'บัญชีผู้ใช้เครือข่ายนนทรี');
    cy.get('[data-testid="username-input"]').should('exist').should('have.attr', 'placeholder', 'เช่น b63xxxxxxxx หรือ regxxx');
    cy.get('[data-testid="password-text"]').should('exist').should('contain.text', 'รหัสผ่าน');
    cy.get('[data-testid="password-input"]').should('exist').should('have.attr', 'placeholder', 'รหัสผ่านบัญชีผู้ใช้เครือข่ายนนทรี', );
    cy.get('[data-testid="login-button"]').should('exist').should('contain.text', 'เข้าสู่ระบบ');
  });

  it('ClubDetail page renders the default elements on the screen', () => {
    cy.visit('http://localhost:3000/clubs/1');
    cy.get('[data-testid="club-image"]').should('exist');
    cy.get('[data-testid="club-label"]').should('exist');
    cy.get('[data-testid="club-information"]').should('exist').should('contain.text', 'หมวดหมู่', 'ที่อยู่');
    cy.get('[data-testid="upcoming-events"]').should('exist');
    cy.get('[data-testid="club-members"]').should('exist').should('contain.text', 'จำนวนสมาชิก');
    cy.get('[data-testid="club-posts"]').should('exist').should('contain.text', 'โพสต์');
  });

  it('PostDetail page renders the default elements on the screen', () => {
    cy.visit('http://localhost:3000/posts/1');
    cy.get('[data-testid="club-label"]').should('exist');
    cy.get('[data-testid="post-title"]').should('exist');
    cy.get('[data-testid="post-content"]').should('exist');
    cy.get('input').should('exist').should('have.attr', 'placeholder', 'แสดงความคิดเห็น');
    cy.get('[data-testid="posts-from-club"]').should('exist').should('contain.text', 'โพสต์ต่างๆจากชมรม')
  });

  it('EventDetail page renders the default elements on the screen', () => {
    cy.visit('http://localhost:3000/events/1');
    cy.get('[data-testid="club-label"]').should('exist');
    cy.get('[data-testid="event-title"]').should('exist');
    cy.get('[data-testid="event-date"]').should('exist').should('contain.text', 'วันเริ่มต้นและสิ้นสุด:');
    cy.get('[data-testid="event-location"]').should('exist').should('contain.text', 'สถานที่จัดกิจกรรม:');
    cy.get('[data-testid="event-time"]').should('exist').should('contain.text', 'ณ เวลา');
    cy.get('[data-testid="event-content"]').should('exist');
    cy.get('button').should('exist').should('contain.text', 'ติดตามอีเว้นท์นี้');
    cy.get('input').should('exist').should('have.attr', 'placeholder', 'แสดงความคิดเห็น');
    cy.get('[data-testid="events-from-club"]').should('exist').should('contain.text', 'อีเว้นท์ต่างๆจากชมรม')
  });
});