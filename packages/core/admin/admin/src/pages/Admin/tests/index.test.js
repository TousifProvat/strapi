import React from 'react';

import { lightTheme, ThemeProvider } from '@strapi/design-system';
import { useStrapiApp } from '@strapi/helper-plugin';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { IntlProvider } from 'react-intl';
import { Router } from 'react-router-dom';

import { useMenu } from '../../../hooks';
import Admin from '../index';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => jest.fn()),
  useSelector: jest.fn(() => 'init'),
}));

jest.mock('@strapi/helper-plugin', () => ({
  ...jest.requireActual('@strapi/helper-plugin'),
  LoadingIndicatorPage: () => <div>Loading</div>,
  useStrapiApp: jest.fn(() => ({ menu: [] })),
  NotFound: () => <div>not found</div>,
  CheckPagePermissions: ({ children }) => children,
  useGuidedTour: jest.fn(() => ({
    guidedTourState: {
      contentTypeBuilder: {
        create: false,
        success: false,
      },
    },
    currentStep: null,
    isGuidedTourVisible: false,
  })),
}));

jest.mock('../../../hooks', () => ({
  useMenu: jest.fn(() => ({ isLoading: true, generalSectionLinks: [], pluginsSectionLinks: [] })),
  useConfigurations: jest.fn(() => ({ showTutorials: false })),
}));

jest.mock('../../../components/LeftMenu', () => () => {
  return <div>menu</div>;
});
jest.mock('../../HomePage', () => () => {
  return <div>HomePage</div>;
});

const makeApp = (history) => (
  <IntlProvider messages={{}} defaultLocale="en" textComponent="span" locale="en">
    <ThemeProvider theme={lightTheme}>
      <Router history={history}>
        <Admin />
      </Router>
    </ThemeProvider>
  </IntlProvider>
);

describe('<Admin />', () => {
  it('should not crash', () => {
    const history = createMemoryHistory();
    const App = makeApp(history);

    const { container } = render(App);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        Loading
      </div>
    `);
  });

  it('should create the plugin routes correctly', async () => {
    useStrapiApp.mockImplementation(() => ({
      menu: [
        {
          to: '/plugins/ctb',
        },
        {
          to: '/plugins/documentation',
          Component: () => ({ default: () => <div>DOCUMENTATION PLUGIN</div> }),
        },
      ],
    }));

    useMenu.mockImplementation(() => ({
      isLoading: false,
      generalSectionLinks: [],
      pluginsSectionLinks: [],
    }));
    const history = createMemoryHistory();
    const App = makeApp(history);

    render(App);

    await waitFor(() => expect(screen.getByText('HomePage')).toBeInTheDocument());

    // act(() => history.push('/plugins/documentation'));

    // await waitFor(() => expect(screen.getByText('DOCUMENTATION PLUGIN')).toBeInTheDocument());
  });
});
