import { Heart, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className='border-t py-4'>
      <div className='flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground'>
        <a
          href='https://github.com/kvoon3/kuse'
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1.5 hover:text-foreground transition-colors'
        >
          <Github className='h-4 w-4' />
          <span>kvoon3/kuse</span>
        </a>
        <span className='hidden sm:inline'>·</span>
        <span className='inline-flex items-center gap-1.5'>
          Made with
          <Heart className='h-4 w-4 fill-red-500 text-red-500' />
        </span>
        <span className='hidden sm:inline'>·</span>
        <span>MIT License</span>
      </div>
    </footer>
  )
}
