import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Heart, Share2, Facebook, Twitter, MessageSquare, Link as LinkIcon } from 'lucide-react';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';
import { useCart } from '@/context/CartContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  gymName?: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

function ProductShareButton({ url, title, description }: { url: string; title: string; description: string }) {
  // Handle share action
  const handleShare = (platform: string) => {
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${description} ${url}`)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      console.log('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full p-0 hover:bg-gray-100"
          aria-label="Share options"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[9999] w-56 rounded-md bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          sideOffset={5}
          side="bottom"
          align="end"
          style={{
            position: 'fixed',
            minWidth: '14rem',
          }}
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-gray-700 outline-none hover:bg-gray-100"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="mr-2 h-4 w-4 text-blue-600" />
            Share on Facebook
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-gray-700 outline-none hover:bg-gray-100"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="mr-2 h-4 w-4 text-blue-400" />
            Share on Twitter
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-gray-700 outline-none hover:bg-gray-100"
            onClick={() => handleShare('whatsapp')}
          >
            <MessageSquare className="mr-2 h-4 w-4 text-green-500" />
            Share on WhatsApp
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="m-1 h-px bg-gray-200" />

          <DropdownMenu.Item
            className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-gray-700 outline-none hover:bg-gray-100"
            onClick={copyToClipboard}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Copy link
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className="fill-white" style={{ position: 'absolute', top: '-4px', right: '1rem' }} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  rating,
  reviewCount,
  inStock,
  gymName = 'our store',
  onAddToCart,
  onBuyNow
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { openPayment, PaymentModal } = usePaymentFlow({
    onSuccess: (paymentMethod) => {
      console.log(`Purchased ${name} with ${paymentMethod}`);
    },
  });

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow();
      return;
    }

    openPayment({
      amount: price,
      itemName: name,
      type: 'product',
      gymName,
      metadata: {
        productId: id,
        productName: name,
        price,
        quantity: 1
      }
    });
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
      return;
    }

    addToCart({
      id,
      name,
      price,
      image,
      quantity: 1
    });
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="aspect-w-1 aspect-h-1 relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-black/5 transition-opacity group-hover:opacity-0" />

        {/* Action Buttons */}
        <div className="absolute right-2 top-2 flex flex-col gap-2">
          {/* Share Button */}
          <ProductShareButton
            url={`${window.location.origin}/products/${id}`}
            title={`Check out ${name} on SportFlare`}
            description={description}
          />

          {/* Favorite Button */}
          <button
            className="rounded-full bg-white/80 p-1.5 text-gray-400 hover:bg-white hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Add to favorites functionality
            }}
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {/* Out of Stock Badge */}
        {!inStock && (
          <div className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-medium text-white">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
            {name}
          </h3>
          <p className="text-sm font-medium text-gray-900">{price.toFixed(2)} TND</p>
        </div>

        {/* Rating */}
        <div className="mt-1 flex items-center">
          <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((ratingItem) => (
              <Star
                key={ratingItem}
                className={`h-4 w-4 ${ratingItem < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                fill={ratingItem < Math.floor(rating) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <span className="ml-2 text-xs text-gray-500">
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-sm"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-indigo-600 text-sm hover:bg-indigo-700"
            onClick={handleBuyNow}
            disabled={!inStock}
          >
            Buy Now
          </Button>
        </div>
      </div>

      <PaymentModal />
    </div>
  );
}
