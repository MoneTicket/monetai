import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

const exampleMessages = [
  {
    heading: '¿Qué es SabidurIA?',
    message: '¿Qué es SabidurIA?'
  },
  {
    heading: '¿Cómo funciona la sanación cuántica?',
    message: '¿Cómo funciona la sanación cuántica?'
  },
  {
    heading: 'Guía para la sanación emocional.',
    message: 'Guía para la sanación emocional.'
  },
  {
    heading: 'Ejercicios para el bienestar físico.',
    message: 'Ejercicios para el bienestar físico.'
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
