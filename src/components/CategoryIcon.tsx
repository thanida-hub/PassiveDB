import React from 'react';
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  Sparkles,
  Receipt,
  Briefcase,
  TrendingUp,
  Wallet,
  Gift,
  DollarSign,
  CircleDot,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5', size }) => {
  const iconProps = { className, size: size || 20 };

  switch (iconName) {
    case 'Utensils':
      return <Utensils {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'Home':
      return <Home {...iconProps} />;
    case 'ShoppingBag':
      return <ShoppingBag {...iconProps} />;
    case 'HeartPulse':
      return <HeartPulse {...iconProps} />;
    case 'Film':
      return <Film {...iconProps} />;
    case 'GraduationCap':
      return <GraduationCap {...iconProps} />;
    case 'Receipt':
      return <Receipt {...iconProps} />;
    case 'Briefcase':
      return <Briefcase {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'Wallet':
      return <Wallet {...iconProps} />;
    case 'Gift':
      return <Gift {...iconProps} />;
    case 'DollarSign':
      return <DollarSign {...iconProps} />;
    case 'Sparkles':
      return <Sparkles {...iconProps} />;
    default:
      return <CircleDot {...iconProps} />;
  }
};
