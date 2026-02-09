import { TanStackDevtools } from '@tanstack/react-devtools'
import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import appCss from '../styles.css?url'
import { Footer } from '~/components/Footer'
import { Header } from '~/components/Header'
import { ThemeProvider } from '~/components/ThemeProvider'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'kuse - Habit Tracker',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider>
      <RootDocument />
    </ThemeProvider>
  )
}

function RootDocument() {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body className='min-h-screen bg-base text-base antialiased'>
        <div className='relative flex min-h-screen flex-col'>
          <Header />
          <main className='flex-1'>
            <Outlet />
          </main>
          <Footer />
        </div>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
