import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">
          Sistema de Ponto
        </h1>
        <div className="space-y-4">
          <Link href="/ponto/thalia" className="w-full">
            <Button className="w-full">Área da Funcionária</Button>
          </Link>
          <Link href="/ponto/administrador" className="w-full">
            <Button variant="outline" className="w-full">
              Área do Administrador
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
