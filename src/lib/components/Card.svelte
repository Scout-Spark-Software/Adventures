<script lang="ts">
  export let variant: "default" | "bordered" | "elevated" | "glass" = "default";
  export let padding: "none" | "sm" | "md" | "lg" = "md";
  export let borderPosition: "none" | "left" | "top" = "none";
  export let borderColor: string = "border-indigo-500";

  const variantClasses = {
    default: "bg-white shadow rounded-lg",
    bordered: "bg-white border border-gray-200 rounded-lg",
    elevated: "bg-white shadow-lg rounded-xl",
    glass: "bg-white/90 backdrop-blur-sm shadow-lg rounded-lg",
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  const borderPositionClasses = {
    none: "",
    left: `border-l-4 ${borderColor}`,
    top: `border-t-4 ${borderColor}`,
  };

  $: classes = `${variantClasses[variant]} ${paddingClasses[padding]} ${borderPositionClasses[borderPosition]}`;
</script>

<div class={classes}>
  {#if $$slots.header}
    <div class="mb-4">
      <slot name="header" />
    </div>
  {/if}

  <slot />

  {#if $$slots.footer}
    <div class="mt-4">
      <slot name="footer" />
    </div>
  {/if}
</div>
