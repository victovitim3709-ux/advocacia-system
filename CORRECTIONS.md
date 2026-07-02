# Correções Necessárias no Código

## 1. `src/services/auth.ts` - TIPAGEM & SEGURANÇA

### Problema: `listUsers()` retorna `any[]`
**Linha 41-47 - ALTERAR:**
```typescript
// ❌ ERRADO
export const listUsers = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .rpc('list_all_users');

  if (error) throw error;
  return data || [];
};
```

**Para:**
```typescript
// ✅ CORRETO
export const listUsers = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .rpc('list_all_users');

  if (error) throw error;
  return (data || []) as Profile[];
};
```

### Problema: `createUser()` retorna `any`
**Linha 50-62 - ALTERAR:**
```typescript
// ❌ ERRADO
export const createUser = async (request: CreateUserRequest): Promise<any> => {
  // ...
  return data;
};
```

**Para:**
```typescript
// ✅ CORRETO
export const createUser = async (request: CreateUserRequest): Promise<Profile> => {
  // ...
  return data as Profile;
};
```

### Problema: Sem validação em `resetUserPassword()`
**Linha 77-85 - ALTERAR:**
```typescript
// ❌ ERRADO
export const resetUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  const { error } = await supabase
    .rpc('reset_user_password', {
      target_user_id: userId,
      new_password: newPassword,
    });

  if (error) throw error;
};
```

**Para:**
```typescript
// ✅ CORRETO
export const resetUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Senha deve ter pelo menos 8 caracteres');
  }
  
  const { error } = await supabase
    .rpc('reset_user_password', {
      target_user_id: userId,
      new_password: newPassword,
    });

  if (error) throw error;
};
```

---

## 2. `src/utils/validators.ts` - VALIDAÇÕES NOVAS

**Adicione ao final do arquivo:**

```typescript
// NOVO: Validação de CPF com dígito verificador
export const validateCPF = (cpf: string): boolean => {
  const clean = cpf.replace(/\D/g, '');
  
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false; // Todos os dígitos iguais
  
  // Validar primeiro dígito verificador
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10))) return false;
  
  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(10, 11))) return false;
  
  return true;
};

// NOVO: Validação de CNPJ com dígito verificador
export const validateCNPJ = (cnpj: string): boolean => {
  const clean = cnpj.replace(/\D/g, '');
  
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;
  
  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  let digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};
```

---

## 3. `src/pages/RecibosPage.tsx` - UPLOAD REAL & MELHORIAS

**Substitua o arquivo inteiro com a versão que:**
- ✅ Implementa upload real para Supabase Storage
- ✅ Adiciona validação de tamanho (máx 10MB)
- ✅ Salva arquivo no banco com metadados
- ✅ Remove comentário "será implementado"

**Arquivo completo:** Veja em `RECIBOS_PAGE_FULL.tsx`

---

## 4. `src/hooks/useRecibos.ts` - ARQUIVO NOVO

**Crie novo arquivo com:**
- Hook `useRecibos()` para listar
- Hook `useCreateRecibo()` para criar
- Hook `useDeleteRecibo()` para deletar
- Hook `useUpdateRecibo()` para editar

---

## 5. `src/services/recibos.ts` - ARQUIVO NOVO

**Crie novo arquivo com:**
- `listRecibos()` - listar com paginação
- `getRecibo()` - buscar um
- `createRecibo()` - criar
- `updateRecibo()` - editar
- `deleteRecibo()` - deletar

---

## Resumo das Correções

| Arquivo | Erro | Severidade | Ação |
|---------|------|-----------|------|
| `auth.ts` | `any[]` em `listUsers()` | 🔴 Alto | Tipar como `Profile[]` |
| `auth.ts` | `any` em `createUser()` | 🔴 Alto | Tipar como `Profile` |
| `auth.ts` | Sem validação em `resetUserPassword()` | 🟡 Médio | Adicionar validação de 8 chars |
| `validators.ts` | Falta `validateCPF()` com dígito verificador | 🟡 Médio | Adicionar função |
| `validators.ts` | Falta `validateCNPJ()` com dígito verificador | 🟡 Médio | Adicionar função |
| `RecibosPage.tsx` | Upload não implementado | 🔴 Alto | Implementar Supabase Storage |
| `RecibosPage.tsx` | Sem limite de arquivo | 🟡 Médio | Adicionar validação 10MB |
| Falta `useRecibos.ts` | Hook não existe | 🔴 Alto | Criar arquivo |
| Falta `services/recibos.ts` | Serviço não existe | 🔴 Alto | Criar arquivo |
