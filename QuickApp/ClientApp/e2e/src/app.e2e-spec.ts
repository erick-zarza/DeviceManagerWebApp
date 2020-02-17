// =============================
// Email: info@somesite.com
// www.somesite.com/templates
// =============================

import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display application title: QuickApp', () => {
    page.navigateTo();
    expect(page.getAppTitle()).toEqual('QuickApp');
  });
});
