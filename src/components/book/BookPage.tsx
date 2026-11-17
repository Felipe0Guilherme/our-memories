import { forwardRef, type ReactNode } from 'react'

interface Props {
  side: 'left' | 'right' | 'single'
  children?: ReactNode
  density?: 'soft' | 'hard'
  hard?: boolean
  number?: number
  outerLeft?: boolean
}

/** Folha do álbum. O ref é exigido pelo react-pageflip. */
export const BookPage = forwardRef<HTMLDivElement, Props>(function BookPage(
  { side, children, density = 'soft', hard, number, outerLeft }, ref,
) {
  return (
    <div ref={ref} data-density={density} style={{ width: '100%', height: '100%' }}>
      <div className={`om-page om-page--${side} ${hard ? 'om-hard' : ''}`}>
        <div className="om-page__inner">{children}</div>
        {number !== undefined && (
          <span
            className="om-hand"
            style={{
              position: 'absolute', bottom: '3.2%', zIndex: 6, fontSize: 13, color: '#8B7562',
              ...(outerLeft ? { left: '7%' } : side === 'single' ? { left: 0, right: 0, textAlign: 'center' } : { right: '7%' }),
            }}
          >
            {number}
          </span>
        )}
      </div>
    </div>
  )
})
