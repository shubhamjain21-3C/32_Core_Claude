import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { properties, deleteProperty } from '@/lib/store'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const property = properties.get(params.id)
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Customers can only delete their own; admin can delete any
  if (session.user.role === 'customer' && property.customerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  deleteProperty(params.id)
  return NextResponse.json({ success: true })
}
