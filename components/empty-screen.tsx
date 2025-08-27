import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

const exampleMessages = [
  {
    heading: '¿Cuál es el saldo de MATIC de mi billetera?',
    message: '¿Cuál es el saldo de MATIC de la billetera 0x...?'
  },
  {
    heading: '¿Cuánto USDC tengo en mi billetera?',
    message: '¿Cuánto USDC tengo en la billetera 0x... del contrato 0x...?'
  },
  {
    heading: '¿Quién es el dueño de este NFT?',
    message: '¿Quién es el dueño del NFT con contrato 0x... y ID 123?'
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
