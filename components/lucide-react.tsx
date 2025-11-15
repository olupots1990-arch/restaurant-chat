
// This is a stub file to make lucide-react imports work.
// In a real project, you would install `lucide-react`.
import React from 'react';

const createLucideIcon = (iconName: string) => {
  const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* A simple placeholder circle */}
      <circle cx="12" cy="12" r="10" />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="currentColor" fontSize="12">
        {iconName.charAt(0)}
      </text>
    </svg>
  );
  Icon.displayName = iconName;
  return Icon;
};

export const Sun = createLucideIcon('Sun');
export const Moon = createLucideIcon('Moon');
export const Volume2 = createLucideIcon('Volume2');
export const Link = createLucideIcon('Link');
export const MapPin = createLucideIcon('MapPin');
export const MessageCircle = createLucideIcon('MessageCircle');
export const Paperclip = createLucideIcon('Paperclip');
export const Mic = createLucideIcon('Mic');
export const Send = createLucideIcon('Send');
export const X = createLucideIcon('X');
export const FileImage = createLucideIcon('FileImage');
export const Zap = createLucideIcon('Zap');
export const BrainCircuit = createLucideIcon('BrainCircuit');
export const MessageSquare = createLucideIcon('MessageSquare');
export const PhoneOff = createLucideIcon('PhoneOff');
export const Search = createLucideIcon('Search');
export const Home = createLucideIcon('Home');
export const User = createLucideIcon('User');
export const Shield = createLucideIcon('Shield');
export const ListTodo = createLucideIcon('ListTodo');
export const Plus = createLucideIcon('Plus');
export const Trash2 = createLucideIcon('Trash2');
