'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { Check, ChevronsUpDown, Circle } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/lib/utils/cookies'

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

interface AssetSelectorProps {
  // No props needed for now, as it will manage its own state
}

const ASSET_COOKIE_NAME = 'selectedAsset'

// Define AssetItem type based on your Supabase 'assets' table
interface AssetItem {
  id: string;
  name: string;
  symbol?: string;
  type: string; // e.g., 'ERC20', 'ERC721', 'Native'
  chain_id: number;
  contract_address?: string | null;
  decimals?: number | null;
  image_url?: string | null;
}

export function AssetSelector({}: AssetSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null)
  const [predefinedAssets, setPredefinedAssets] = useState<AssetItem[]>([])

  // Function to fetch assets from Supabase
  const fetchAssets = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('assets')
      .select('id, name, symbol, type, chain_id, contract_address, decimals, image_url')
      .eq('is_predefined', true) // Fetch only predefined assets for now
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching assets:', error)
      // Optionally toast error
      return
    }
    setPredefinedAssets(data as AssetItem[])

    // Load selected asset from cookie
    const saved = getCookie(ASSET_COOKIE_NAME)
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved) as AssetItem
        // Ensure the saved asset is still in the predefined list
        if (data.some(asset => asset.id === parsedSaved.id)) {
          setSelectedAsset(parsedSaved)
        }
      } catch (e) {
        console.error('Failed to parse saved asset:', e)
      }
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const handleAssetSelect = (asset: AssetItem) => {
    const newValue = selectedAsset?.id === asset.id ? null : asset
    setSelectedAsset(newValue)
    setCookie(ASSET_COOKIE_NAME, newValue ? JSON.stringify(newValue) : '')
    setOpen(false)
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
          {selectedAsset ? (
            <div className="flex items-center space-x-1">
              {selectedAsset.image_url ? (
                <Image
                  src={selectedAsset.image_url}
                  alt={selectedAsset.symbol || selectedAsset.name}
                  width={18}
                  height={18}
                  className="rounded-full"
                />
              ) : (
                <Circle size={18} className="text-gray-400" />
              )}
              <span className="text-xs font-medium">{selectedAsset.symbol || selectedAsset.name}</span>
            </div>
          ) : (
            'Select Asset'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search asset..." />
          <CommandList>
            <CommandEmpty>No assets found.</CommandEmpty>
            <CommandGroup heading="Predefined Assets">
              {predefinedAssets.map(asset => (
                <CommandItem
                  key={asset.id}
                  value={asset.symbol || asset.name}
                  onSelect={() => handleAssetSelect(asset)}
                  className="flex justify-between"
                >
                  <div className="flex items-center space-x-2">
                    {asset.image_url ? (
                      <Image
                        src={asset.image_url}
                        alt={asset.symbol || asset.name}
                        width={18}
                        height={18}
                        className="rounded-full"
                      />
                    ) : (
                      <Circle size={18} className="text-gray-400" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">
                        {asset.name} ({asset.symbol})
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Chain ID: {asset.chain_id} {asset.contract_address ? ` | ${asset.contract_address.substring(0, 6)}...` : ''}
                      </span>
                    </div>
                  </div>
                  <Check
                    className={`h-4 w-4 ${
                      selectedAsset?.id === asset.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
