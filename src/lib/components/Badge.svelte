<script lang="ts">
  export let variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' = 'neutral';
  export let size: 'xs' | 'sm' | 'md' = 'sm';
  export let rounded: 'full' | 'md' | 'lg' = 'full';
  export let icon: boolean = false;

  const variantClasses = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  const roundedClasses = {
    full: 'rounded-full',
    md: 'rounded-md',
    lg: 'rounded-lg'
  };

  $: classes = `inline-flex items-center font-medium border ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClasses[rounded]}`;
</script>

<span class={classes}>
  {#if icon}
    <slot name="icon" />
  {/if}
  <slot />
</span>
