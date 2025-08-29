'use client'

import { useEffect, useState } from 'react'

import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react'
import { ethers } from 'ethers'

import { getCookie, setCookie } from '@/lib/utils/cookies'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/hooks/use-current-user'

import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Input } from './ui/input'

interface AddressSelectorProps {
  // No props needed for now, as it will manage its own state
}

const ADDRESS_COOKIE_NAME = 'selectedAddress'
const SAVED_ADDRESSES_COOKIE_NAME = 'savedAddresses'

export function AddressSelector({}: AddressSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [newAddressInput, setNewAddressInput] = useState<string>('')
  const [savedAddresses, setSavedAddresses] = useState<AddressItem[]>([])
  const [isAdding, setIsAdding] = useState(false)

  const user = useCurrentUser()

  interface AddressItem {
    id: string;
    address: string;
    label?: string;
    is_active?: boolean;
  }

  const fetchAddresses = async () => {
    if (!user?.id) {
      setSavedAddresses([])
      setSelectedAddress('')
      return
    }
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_addresses')
      .select('id, address, label, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return
    }
    setSavedAddresses(data as AddressItem[])
    const active = data.find(addr => addr.is_active)
    if (active) {
      setSelectedAddress(active.address)
    } else {
      const saved = getCookie(ADDRESS_COOKIE_NAME)
      if (saved && data.some(addr => addr.address === saved)) {
        setSelectedAddress(saved)
      } else if (data.length > 0) {
        setSelectedAddress(data[0].address)
      }
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [user?.id])

  const handleAddressSelect = async (address: string) => {
    setSelectedAddress(address)
    setCookie(ADDRESS_COOKIE_NAME, address)

    if (user?.id) {
      const supabase = createClient()
      await supabase.from('user_addresses').update({ is_active: false }).eq('user_id', user.id)
      await supabase.from('user_addresses').update({ is_active: true }).eq('user_id', user.id).eq('address', address)
    }
    setOpen(false)
  }

  const handleAddNewAddress = async () => {
    const trimmedAddress = newAddressInput.trim()
    if (!user?.id) {
      alert('Please log in to save addresses.')
      return
    }
    if (isAdding) return

    if (trimmedAddress && ethers.isAddress(trimmedAddress)) {
      if (savedAddresses.some(addr => addr.address === trimmedAddress)) {
        alert('Address already saved.')
        setNewAddressInput('')
        return
      }

      setIsAdding(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_addresses')
        .insert({ user_id: user.id, address: trimmedAddress, label: trimmedAddress })
        .select()

      setIsAdding(false)

      if (error) {
        console.error('Error adding new address:', error)
        alert('Failed to add address: ' + error.message)
        return
      }

      const newAddressItem = data[0] as AddressItem
      setSavedAddresses(prev => [newAddressItem, ...prev])
      setSelectedAddress(newAddressItem.address)
      setCookie(ADDRESS_COOKIE_NAME, newAddressItem.address)
      setNewAddressInput('')
      setOpen(false)
    } else {
      alert('Invalid Ethereum address format.')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="text-sm rounded-full shadow-none focus:ring-0"
        >
          {selectedAddress ? (
            <span className="text-xs font-medium">
              {selectedAddress.substring(0, 6)}...{selectedAddress.substring(selectedAddress.length - 4)}
            </span>
          ) : (
            'Select Address'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Add or search address..."
            value={newAddressInput}
            onValueChange={setNewAddressInput}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddNewAddress()
              }
            }}
          />
          <CommandList>
            <CommandEmpty>No addresses found.</CommandEmpty>
            <CommandGroup heading="Saved Addresses">
              {savedAddresses.map(item => (
                <CommandItem
                  key={item.id}
                  value={item.address}
                  onSelect={() => handleAddressSelect(item.address)}
                  className="flex justify-between"
                >
                  <span className="text-xs">
                    {item.label || `${item.address.substring(0, 6)}...${item.address.substring(item.address.length - 4)}`}
                  </span>
                  <Check
                    className={`h-4 w-4 ${
                      selectedAddress === item.address ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            {newAddressInput && !ethers.isAddress(newAddressInput.trim()) && (
              <CommandItem disabled>
                <span className="text-red-500 text-xs">Invalid address format</span>
              </CommandItem>
            )}
            {newAddressInput && ethers.isAddress(newAddressInput.trim()) && !savedAddresses.some(addr => addr.address === newAddressInput.trim()) && (
              <CommandItem onSelect={handleAddNewAddress} disabled={isAdding}>
                {isAdding ? (
                  <span className="text-xs">Adding...</span>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="text-xs">Add new address: {newAddressInput.substring(0, 6)}...{newAddressInput.substring(newAddressInput.length - 4)}</span>
                  </>
                )}
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}