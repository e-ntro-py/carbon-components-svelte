<script context="module">
  /**
   * Depth-first search to find a node by id; returns an array
   * of nodes from the initial node to the matching leaf.
   * @param {TreeNode} node
   * @param {TreeNodeId} id
   * @returns {null | TreeNode[]}
   */
  function findNodeById(node, id) {
    if (node === null) return null;
    if (node.id === id) return [node];
    if (!Array.isArray(node.nodes)) {
      return null;
    }

    for (const child of node.nodes) {
      const nodes = findNodeById(child, id);

      if (Array.isArray(nodes)) {
        nodes.unshift(node);
        return nodes;
      }
    }

    return null;
  }
</script>

<script>
  /**
   * @typedef {string | number} TreeNodeId
   * @typedef {{ id: TreeNodeId; text: any; icon?: any; disabled?: boolean; nodes?: TreeNode[]; }} TreeNode
   * @slot {{ node: { id: TreeNodeId; text: string; expanded: boolean, leaf: boolean; disabled: boolean; selected: boolean; } }}
   * @event {TreeNode & { expanded: boolean; leaf: boolean; }} select
   * @event {TreeNode & { expanded: boolean; leaf: boolean; }} toggle
   * @event {TreeNode & { expanded: boolean; leaf: boolean; }} focus
   */

  /**
   * Provide an array of nodes to render
   * @type {Array<TreeNode>}
   */
  export let nodes = [];

  /**
   * Set the current active node id
   * Only one node can be active
   * @type {TreeNodeId}
   */
  export let activeId = "";

  /**
   * Set the node ids to be selected
   * @type {ReadonlyArray<TreeNodeId>}
   */
  export let selectedIds = [];

  /**
   * Set the node ids to be expanded
   * @type {ReadonlyArray<TreeNodeId>}
   */
  export let expandedIds = [];

  /**
   * Specify the TreeView size
   * @type {"default" | "compact"}
   */
  export let size = "default";

  /** Specify the label text */
  export let labelText = "";

  /** Set to `true` to visually hide the label text */
  export let hideLabel = false;

  /**
   * Programmatically expand all nodes
   * @type {() => void}
   */
  export function expandAll() {
    expandedIds = [...nodeIds];
  }

  /**
   * Programmatically collapse all nodes
   * @type {() => void}
   */
  export function collapseAll() {
    expandedIds = [];
  }

  /**
   * Programmatically expand a subset of nodes.
   * Expands all nodes if no argument is provided
   * @type {(filterId?: (node: TreeNode) => boolean) => void}
   */
  export function expandNodes(filterNode = (node) => false) {
    expandedIds = flattenedNodes
      .filter(
        (node) =>
          filterNode(node) ||
          node.nodes?.some((child) => filterNode(child) && child.nodes),
      )
      .map((node) => node.id);
  }

  /**
   * Programmatically collapse a subset of nodes.
   * Collapses all nodes if no argument is provided
   * @type {(filterId?: (node: TreeNode) => boolean) => void}
   */
  export function collapseNodes(filterNode = (node) => true) {
    expandedIds = flattenedNodes
      .filter((node) => expandedIds.includes(node.id) && !filterNode(node))
      .map((node) => node.id);
  }

  /**
   * Programmatically show a node by `id`.
   * The matching node will be expanded, selected, and focused
   * @type {(id: TreeNodeId) => void}
   */
  export function showNode(id) {
    for (const child of nodes) {
      const nodes = findNodeById(child, id);

      if (nodes) {
        const ids = nodes.map((node) => node.id);
        const nodeIds = new Set(ids);

        expandNodes((node) => nodeIds.has(node.id));

        const lastId = ids[ids.length - 1];

        activeId = lastId;
        selectedIds = [lastId];

        tick().then(() => {
          ref?.querySelector(`[id="${lastId}"]`)?.focus();
        });

        break;
      }
    }
  }

  import { createEventDispatcher, setContext, onMount, tick } from "svelte";
  import { writable } from "svelte/store";
  import TreeViewNodeList from "./TreeViewNodeList.svelte";

  const dispatch = createEventDispatcher();
  const labelId = `label-${Math.random().toString(36)}`;
  const activeNodeId = writable(activeId);
  const selectedNodeIds = writable(selectedIds);
  const expandedNodeIds = writable(expandedIds);

  let ref = null;
  let treeWalker = null;

  setContext("TreeView", {
    activeNodeId,
    selectedNodeIds,
    expandedNodeIds,
    clickNode: (node) => {
      activeId = node.id;
      selectedIds = [node.id];
      dispatch("select", node);
    },
    selectNode: (node) => {
      selectedIds = [node.id];
    },
    expandNode: (node, expanded) => {
      if (expanded) {
        expandedIds = [...expandedIds, node.id];
      } else {
        expandedIds = expandedIds.filter((_id) => _id !== node.id);
      }
    },
    focusNode: (node) => dispatch("focus", node),
    toggleNode: (node) => dispatch("toggle", node),
  });

  function handleKeyDown(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();

    treeWalker.currentNode = e.target;

    let node = null;

    if (e.key === "ArrowUp") node = treeWalker.previousNode();
    if (e.key === "ArrowDown") node = treeWalker.nextNode();
    if (node && node !== e.target) {
      node.tabIndex = "0";
      node.focus();
    }
  }

  onMount(() => {
    const firstFocusableNode = ref.querySelector(
      "li.bx--tree-node:not(.bx--tree-node--disabled)",
    );

    if (firstFocusableNode != null) {
      firstFocusableNode.tabIndex = "0";
    }
  });

  /**
   * Recursively flattens a tree of nodes into a single array
   * @param {Array<TreeNode & { nodes?: TreeNode[] }>} nodes
   * @returns {Array<TreeNode>}
   */
  function traverse(nodes) {
    return nodes.reduce((acc, node) => {
      acc.push(node);
      if (Array.isArray(node.nodes) && node.nodes.length > 0) {
        acc.push(...traverse(node.nodes));
      }
      return acc;
    }, []);
  }

  $: flattenedNodes = traverse(nodes);
  $: nodeIds = flattenedNodes.map((node) => node.id);
  $: activeNodeId.set(activeId);
  $: selectedNodeIds.set(selectedIds);
  $: expandedNodeIds.set(expandedIds);
  $: if (ref) {
    treeWalker = document.createTreeWalker(ref, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        if (node.classList.contains("bx--tree-node--disabled"))
          return NodeFilter.FILTER_REJECT;
        if (node.matches("li.bx--tree-node")) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_SKIP;
      },
    });
  }
</script>

{#if !hideLabel}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label id={labelId} class:bx--label={true}>
    <slot name="labelText">{labelText}</slot>
  </label>
{/if}

<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
<ul
  {...$$restProps}
  role="tree"
  bind:this={ref}
  class:bx--tree={true}
  class:bx--tree--default={size === "default"}
  class:bx--tree--compact={size === "compact"}
  aria-label={hideLabel ? labelText : undefined}
  aria-labelledby={!hideLabel ? labelId : undefined}
  aria-multiselectable={selectedIds.length > 1 || undefined}
  on:keydown
  on:keydown|stopPropagation={handleKeyDown}
>
  <TreeViewNodeList root {nodes} let:node>
    <slot {node}>
      {node.text}
    </slot>
  </TreeViewNodeList>
</ul>
