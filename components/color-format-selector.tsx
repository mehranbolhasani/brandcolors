'use client';

import { ColorFormat } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getColorFormat, setColorFormat } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ColorFormatSelectorProps {
  value: ColorFormat;
  onChange: (format: ColorFormat) => void;
}

export function ColorFormatSelector({ value, onChange }: ColorFormatSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ColorFormat)}>
      <SelectTrigger className="w-[140px] h-9">
        <SelectValue placeholder="Format" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="hex">HEX</SelectItem>
        <SelectItem value="rgb">RGB</SelectItem>
        <SelectItem value="hsl">HSL</SelectItem>
        <SelectItem value="oklch">OKLCH</SelectItem>
      </SelectContent>
    </Select>
  );
}
