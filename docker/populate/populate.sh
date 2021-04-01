echo "Populating initial content in ${KOLIBRI_HOME}"

# Copied from
# https://github.com/endlessm/eos-image-builder/blob/master/hooks/image/60-kolibri-content

endless_key_resources_channel_id=d29581bbf4394456971b8cb807219c39
endless_os_kolibri_help_channel_id=e8a879742b2249a0a4b890f9903916f7
extra_kolibri_channels=(
  "c9d7f950ab6b5a1199e3d6c10d7f0103"     # Khan Academy English
  "85b42a40745f4e2392ed62e72d4dad6e"     # OceanX
  "1e378725d3924b47aa5e1260628820b5"     # TED-Ed Lessons
  "bcc6e12a0ddf4a17a8b600c6b880e3ed"     # Common Sense Education Lessons
  "c8540424d77f44f8ae306e22d3b14eaf"     # All About the Coronavirus
  "3e464ee12f6a50a781cddf59147b48b1"     # Sikana English
  "74f36493bb475b62935fa8705ed59fed"     # Thoughtful Learning
  "000409f81dbe5d1ba67101cb9fed4530"     # Touchable Earth
  "197934f144305350b5820c7c4dd8e194"     # PhET
  "e409b964366a59219c148f2aaa741f43"     # Blockly Games
  "bbb4ea407a3c450cb18cbaa76f2d75cd"     # CSpathshala (English)
  "08a53136a1555f64b0496b3e1318b0cd"     # Ubongo Kids
  "0418cc231e9c5513af0fff9f227f7172"     # Free English with Hello Channel
  "8a2d480dbc9b53408c688e8188326b16"     # Aflatoun Academy
  "da53f90b1be25752a04682bbc353659f"     # Ciencia NASA
  "fc47aee82e0153e2a30197d3fdee1128"     # OpenStax
  "1d8f6d84618153c18c695d85074952a7"     # CK12
  "$endless_os_kolibri_help_channel_id"  # Endless OS Kolibri Help
)

mkdir -p "${KOLIBRI_HOME}"
kolibri manage importchannel network "${endless_key_resources_channel_id}"

for channel_id in "${extra_kolibri_channels[@]}"; do
  kolibri manage importchannel network "${channel_id}"
done

kolibri manage importcontent --node_ids 3b909a18242c48208dbc49d06bc48162,6e8f60c6b9c841969853d48f4eff22cf network ${endless_os_kolibri_help_channel_id}

python3 "/docker/populate/kolibri-pick-content-from-channel" "${endless_key_resources_channel_id}" --ignore-channel="${endless_os_kolibri_help_channel_id}"

kolibri manage deletechannel ${endless_key_resources_channel_id}

position=1
for channel_id in "${extra_kolibri_channels[@]}"; do
  kolibri manage setchannelposition "${channel_id}" ${position} || true
  let position=position+1
done

# (echo yes; echo yes) | kolibri manage deprovision
exit 0
