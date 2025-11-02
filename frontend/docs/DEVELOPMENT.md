# 🎨 Frontend Development Guide

## Component Development

### Creating a New Component

```typescript
// src/components/MyComponent.tsx
import React from 'react';
import { Typography, Box } from '@mui/material';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5">{title}</Typography>
      <button onClick={onAction}>Action</button>
    </Box>
  );
};

export default MyComponent;
```

### Component Best Practices

✅ **DO:**
- Use functional components with hooks
- Define TypeScript interfaces for props
- Keep components small and focused
- Use Material-UI components when possible
- Extract reusable logic into custom hooks

❌ **DON'T:**
- Use class components
- Mutate props or state directly
- Put business logic in components
- Have deeply nested components
- Forget to cleanup effects

---

## State Management Patterns

### Local State

```typescript
const [data, setData] = useState<DataType[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Fetching Data Pattern

```typescript
useEffect(() => {
  let mounted = true;
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      if (mounted) {
        setData(result);
      }
    } catch (err) {
      if (mounted) {
        setError(err.message);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };
  
  fetchData();
  
  return () => {
    mounted = false;
  };
}, []);
```

---

## TypeScript Types

### Define Types

```typescript
// src/types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  is_online: boolean;
  last_seen?: string;
}

export interface ChatRoom {
  id: number;
  name?: string;
  is_group: boolean;
  created_by: number;
  created_at: string;
  participants: User[];
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  chatroom_id: number;
  is_read: boolean;
  created_at: string;
  sender: User;
}
```

---

## Testing (Future)

### Component Test

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('calls onAction when button clicked', () => {
    const mockAction = jest.fn();
    render(<MyComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

---

## Performance Optimization

### React.memo

```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // Only re-renders when data changes
  return <div>{/* render logic */}</div>;
});
```

### useCallback

```typescript
const handleClick = useCallback(() => {
  // Function reference stays same between renders
  doSomething(value);
}, [value]);
```

### useMemo

```typescript
const computedValue = useMemo(() => {
  // Only recomputes when dependencies change
  return expensiveOperation(data);
}, [data]);
```

---

**Version:** 1.0.0 | **Last Updated:** Oktober 2025
